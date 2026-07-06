import os
import json
import requests
import google.generativeai as genai
from dotenv import load_dotenv

# 環境変数の読み込み
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def calculate_ma(candles, period):
    ma = []
    for i in range(len(candles)):
        if i < period - 1:
            ma.append(None)
        else:
            total = sum(c["close"] for c in candles[i - period + 1 : i + 1])
            ma.append(total / period)
    return ma

def fetch_all_quizzes():
    """Supabaseからすべてのクイズデータを取得"""
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        print("[ERROR] Supabaseの環境変数が設定されていません。")
        return []

    url = f"{SUPABASE_URL}/rest/v1/quizzes?select=*"
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"[ERROR] クイズデータの取得に失敗しました: {e}")
        return []

def update_quiz_explanation(quiz_id, explanation):
    """Supabase上のクイズの解説をアップデート"""
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        return False

    url = f"{SUPABASE_URL}/rest/v1/quizzes?id=eq.{quiz_id}"
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    
    payload = {
        "ai_explanation": explanation
    }
    
    try:
        response = requests.patch(url, headers=headers, json=payload, timeout=10)
        response.raise_for_status()
        return True
    except Exception as e:
        print(f"[ERROR] クイズID {quiz_id} の解説アップデートに失敗しました: {e}")
        return False

def regenerate_explanation(quiz_data, correct_chart_summary):
    """正しい情報に基づいてGeminiで解説を再生成"""
    if not GEMINI_API_KEY:
        return "【解説再生成エラー】APIキーがありません。"

    tick_stream = quiz_data.get("tick_stream_data", [])
    tick_stream_summary = f"開始時板比率: 売り厚め。10秒間で現在値が {tick_stream[0]['current_price']}円から{tick_stream[-1]['current_price']}円へ変化。"

    prompt = f"""
あなたはプロのデイトレーダーです。以下の株式時系列データ（開始前のチャート推移、10秒間の板状況の推移、出来高、歩み値）を分析し、その後株価が「{quiz_data['answer_direction']}（値変化率: {quiz_data['price_change_ratio']}%）」となった決定的なテクニカル要因を解説してください。

【データ概要】
・銘柄: {quiz_data['name']} ({quiz_data['symbol']})
・開始前チャート傾向: {correct_chart_summary}
・10秒間の板の厚みの変化: {tick_stream_summary}

【出力ルール】
・デイトレード・スキャルピングの視点から、移動平均線、VWAP、板の買い圧力・売り圧力の偏り、歩み値の大口約定などに焦点を当ててください。
・ユーザーが「次に同じ局面が来たら正解できる」ように、着眼点を簡潔に解説してください。
・250文字〜300文字程度で、要点を整理して日本語で出力してください。
・「ゴールデンクロス」や「デッドクロス」という語は、本当に発生している場合（{correct_chart_summary} に明記されている場合）のみ記述してください。発生していない場合は絶対に記述しないでください。
"""
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"[ERROR] Gemini APIでの解説再生成失敗: {e}")
        return None

def analyze_and_fix():
    print("Supabaseからクイズデータを読み込んでいます...")
    quizzes = fetch_all_quizzes()
    print(f"合計 {len(quizzes)} 件のクイズが見つかりました。")

    mismatches = 0
    fixed_count = 0

    for idx, quiz in enumerate(quizzes):
        quiz_id = quiz["id"]
        symbol = quiz["symbol"]
        name = quiz["name"]
        explanation = quiz["ai_explanation"]
        initial_candles = quiz["initial_chart_data"]

        if len(initial_candles) < 30:
            print(f"[{idx+1}/{len(quizzes)}] ID: {quiz_id} ({name}) - 警告: キャンドル数が {len(initial_candles)} 本と少なすぎます。スキップします。")
            continue

        # 移動平均線の計算
        ma5 = calculate_ma(initial_candles, 5)
        ma25 = calculate_ma(initial_candles, 25)

        # 直近2本のクロス判定
        # 最新 (index=29) と 1つ前 (index=28)
        # ※キャンドル数が30本と仮定
        is_golden_cross = False
        is_dead_cross = False

        if ma5[28] is not None and ma25[28] is not None and ma5[29] is not None and ma25[29] is not None:
            if ma5[28] <= ma25[28] and ma5[29] > ma25[29]:
                is_golden_cross = True
            elif ma5[28] >= ma25[28] and ma5[29] < ma25[29]:
                is_dead_cross = True

        # 解説内に「ゴールデンクロス」「デッドクロス」という言葉が含まれているか
        has_gc_text = "ゴールデンクロス" in explanation
        has_dc_text = "デッドクロス" in explanation

        # 不整合チェック
        mismatch_detected = False
        reason = ""

        if has_gc_text and not is_golden_cross:
            mismatch_detected = True
            reason = "解説に「ゴールデンクロス」とあるが、実際には発生していない"
        elif has_dc_text and not is_dead_cross:
            mismatch_detected = True
            reason = "解説に「デッドクロス」とあるが、実際には発生していない"

        if mismatch_detected:
            mismatches += 1
            print(f"[{idx+1}/{len(quizzes)}] 不整合検出! ID: {quiz_id} | {name} ({symbol})")
            print(f"  理由: {reason}")
            print(f"  現在の解説: {explanation[:80]}...")
            
            # 正しいチャート要約の作成
            current_price = initial_candles[-1]["close"]
            start_price = initial_candles[0]["close"]
            overall_up = current_price > start_price

            if is_golden_cross:
                correct_summary = f"短期移動平均線(MA5)が中期移動平均線(MA25)を上抜けるゴールデンクロスが発生。直近30分終値: {start_price}円 -> {current_price}円"
            elif is_dead_cross:
                correct_summary = f"短期移動平均線(MA5)が中期移動平均線(MA25)を下抜けるデッドクロスが発生。直近30分終値: {start_price}円 -> {current_price}円"
            else:
                ma5_val = ma5[-1]
                ma25_val = ma25[-1]
                if ma5_val > ma25_val:
                    if overall_up:
                        trend_desc = "短期移動平均線(MA5)が中期移動平均線(MA25)の上で推移する、堅調な上昇トレンド（ゴールデンクロスは発生していません）"
                    else:
                        trend_desc = "短期移動平均線(MA5)は中期移動平均線(MA25)の上にあるが、足元はもみ合い・調整局面（ゴールデンクロスは発生していません）"
                else:
                    if not overall_up:
                        trend_desc = "短期移動平均線(MA5)が中期移動平均線(MA25)の下で推移する、下降トレンド（デッドクロスは発生していません）"
                    else:
                        trend_desc = "短期移動平均線(MA5)は中期移動平均線(MA25)の下にあるが、足元は反発局面（デッドクロスは発生していません）"
                correct_summary = f"{trend_desc}。直近30分終値: {start_price}円 -> {current_price}円"

            print(f"  正しい開始前チャート傾向: {correct_summary}")
            print("  Geminiで解説を再生成中...")
            new_explanation = regenerate_explanation(quiz, correct_summary)
            
            if new_explanation:
                print(f"  新しい解説: {new_explanation[:80]}...")
                # Supabaseをアップデート
                success = update_quiz_explanation(quiz_id, new_explanation)
                if success:
                    print("  -> [SUCCESS] データベースの解説を更新しました。")
                    fixed_count += 1
                else:
                    print("  -> [FAILED] データベースの更新に失敗しました。")
            else:
                print("  -> [FAILED] 解説の再生成に失敗しました。")
        else:
            # 整合している場合でも一応出力
            pass

    print("\n==========================================")
    print("チェック完了レポート")
    print(f"総スキャン数: {len(quizzes)} 件")
    print(f"不整合検出数: {mismatches} 件")
    print(f"自動修正数: {fixed_count} 件")
    print("==========================================")

if __name__ == "__main__":
    analyze_and_fix()

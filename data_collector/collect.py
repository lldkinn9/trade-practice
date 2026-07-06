import os
import time
import json
import argparse
import requests
from datetime import datetime, timezone, timedelta
import google.generativeai as genai
from dotenv import load_dotenv

# 環境変数の読み込み
load_dotenv()

KABU_API_PASSWORD = os.getenv("KABU_API_PASSWORD")
KABU_API_PORT = os.getenv("KABU_API_PORT", "18080")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


# 銘柄リスト
TARGET_SYMBOLS = {
    "6526": "ソシオネクスト", # 仕様書の指定に準拠
    "6857": "アドバンテスト",
    "9501": "東京電力HD",
    "7203": "トヨタ自動車"
}

def calculate_ma(candles, period):
    ma = []
    for i in range(len(candles)):
        if i < period - 1:
            ma.append(None)
        else:
            total = sum(c["close"] for c in candles[i - period + 1 : i + 1])
            ma.append(total / period)
    return ma

def get_kabu_token():
    """kabuステーションAPIからトークンを取得"""
    url = f"http://localhost:{KABU_API_PORT}/kabusapi/token"
    payload = {"APIPassword": KABU_API_PASSWORD}
    try:
        response = requests.post(url, json=payload, timeout=5)
        if response.status_code != 200:
            print(f"[ERROR] kabuステーションAPIトークン取得失敗 (ステータスコード: {response.status_code})")
            try:
                err_data = response.json()
                print(f"[ERROR] エラー詳細: {err_data}")
            except Exception:
                print(f"[ERROR] レスポンスボディ: {response.text}")
            return None
        return response.json().get("Token")
    except Exception as e:
        print(f"[ERROR] kabuステーションAPIトークン取得リクエスト失敗: {e}")
        return None

def fetch_board_data(symbol, token):
    """kabuステーションAPIから板情報を取得"""
    url = f"http://localhost:{KABU_API_PORT}/kabusapi/board/{symbol}@1"
    headers = {"X-API-KEY": token}
    try:
        response = requests.get(url, headers=headers, timeout=3)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"[ERROR] 板情報取得失敗 ({symbol}): {e}")
        return None

def generate_mock_board(symbol, base_price, seconds_elapsed):
    """場外・土日テスト用の模擬板データ生成"""
    import random
    # 少しずつ価格が変動するようにシミュレート
    price_change = int(random.choice([-10, -5, 0, 5, 10]) * (1 if seconds_elapsed < 5 else 1.5))
    current_price = base_price + price_change
    
    # 5気配の生成
    bids = []
    asks = []
    for i in range(1, 6):
        bids.append({"price": current_price - i * 10, "volume": random.randint(500, 5000)})
        asks.append({"price": current_price + i * 10, "volume": random.randint(500, 5000)})
        
    # 歩み値
    executions = []
    if random.random() > 0.3:
        executions.append({
            "time": datetime.now().strftime("%H:%M:%S"),
            "price": current_price,
            "volume": random.randint(100, 2000),
            "type": random.choice(["BUY", "SELL", "UNKNOWN"])
        })
        
    return {
        "current_price": current_price,
        "bids": bids,
        "asks": asks,
        "executions": executions
    }

def generate_gemini_explanation(quiz_data):
    """Gemini 1.5 Flash を使用してテクニカル分析解説文を生成"""
    if not GEMINI_API_KEY:
        print("[WARNING] GEMINI_API_KEY が設定されていません。ダミーの解説文を使用します。")
        return "【デモ解説】板情報において買いの厚みが強まり、歩み値でも買い約定が連続したため、モメンタムに乗って株価が上昇しました。短期移動平均線からの乖離も小さく、健全な上昇トレンドを維持しています。"

    # プロンプトの構築
    prompt = f"""
あなたはプロのデイトレーダーです。以下の株式時系列データ（開始前のチャート推移、10秒間の板状況の推移、出来高、歩み値）を分析し、その後株価が「{quiz_data['answer_direction']}（値変化率: {quiz_data['price_change_ratio']}%）」となった決定的なテクニカル要因を解説してください。

【データ概要】
・銘柄: {quiz_data['name']} ({quiz_data['symbol']})
・開始前チャート傾向: {quiz_data['initial_chart_summary']}
・10秒間の板の厚みの変化: {quiz_data['tick_stream_summary']}

【出力ルール】
・デイトレード・スキャルピングの視点から、移動平均線、VWAP、板の買い圧力・売り圧力の偏り、歩み値の大口約定などに焦点を当ててください。
・ユーザーが「次に同じ局面が来たら正解できる」ように、着眼点を簡潔に解説してください。
・250文字〜300文字程度で、要点を整理して日本語で出力してください。
"""
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"[ERROR] Gemini API 呼び出し失敗: {e}")
        return "【解説生成エラー】AIによる解説の自動生成に失敗しました。テクニカル指標および板の厚みの偏り（オーバー/アンダー比）を考慮し、順張りまたは逆張りの判断を行ってください。"

def insert_to_supabase(quiz_data):
    """Supabaseにクイズデータをインサート"""
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        print("[WARNING] Supabaseの環境変数が設定されていません。ローカルファイルに保存します。")
        with open("quiz_data_draft.json", "w", encoding="utf-8") as f:
            json.dump(quiz_data, f, ensure_ascii=False, indent=2)
        print("-> quiz_data_draft.json に保存しました。")
        return False

    url = f"{SUPABASE_URL}/rest/v1/quizzes"
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    
    try:
        response = requests.post(url, headers=headers, json=quiz_data, timeout=10)
        response.raise_for_status()
        print(f"[SUCCESS] Supabaseへのデータ格納が完了しました。銘柄: {quiz_data['name']}")
        return True
    except Exception as e:
        print(f"[ERROR] Supabaseへの格納失敗: {e}")
        return False

def run_collection(symbol, mock_mode=False):
    name = TARGET_SYMBOLS.get(symbol, "未知の銘柄")
    print(f"\n==========================================")
    print(f"データ収集開始: {name} ({symbol}) | モード: {'MOCK' if mock_mode else 'REAL'}")
    print(f"==========================================")

    token = None
    if not mock_mode:
        token = get_kabu_token()
        if not token:
            print("[CRITICAL] kabuステーションAPIトークンが取得できません。kabuステーションがログイン状態で起動しているか確認してください。")
            import sys
            sys.exit(1)

    # 1. 開始前チャート（擬似的に30本生成）
    # 実データモードの場合は、kabuステーションから現在値を1回取得して base_price に設定
    base_price = None
    if not mock_mode and token:
        board = fetch_board_data(symbol, token)
        if board:
            base_price = board.get("CurrentPrice") or board.get("CalcPrice")
            
    # 取得できなかった場合やモックモードの場合はデフォルトの目安価格を使用
    if not base_price:
        base_price = 2500 if symbol == "6526" else 6400 if symbol == "6857" else 550 if symbol == "9501" else 2800
    
    initial_candles = []
    current = base_price
    now = datetime.now()
    for i in range(30, 0, -1):
        t_str = (datetime.now().timestamp() - i * 60)
        t_dt = datetime.fromtimestamp(t_str)
        open_p = current
        close_p = current + int((open_p * 0.0005) * (1 if i%3==0 else -0.8))
        initial_candles.append({
            "time": t_dt.strftime("%H:%M"),
            "open": open_p,
            "high": max(open_p, close_p) + 5,
            "low": min(open_p, close_p) - 5,
            "close": close_p,
            "volume": 8000 + (i * 200)
        })
        current = close_p

    start_price = current
    print(f"開始基準値: {start_price}円")

    # 2. 10秒間の板ストリーム収集 (1秒刻み)
    tick_stream = []
    print("板ストリームの収集を開始します (10秒間)...")
    for sec in range(11):
        if mock_mode:
            step_data = generate_mock_board(symbol, start_price, sec)
        else:
            board = fetch_board_data(symbol, token)
            if board:
                # パース
                step_data = {
                    "timestamp": sec,
                    "current_price": board.get("CurrentPrice") or board.get("CalcPrice") or start_price,
                    "bids": [{"price": b.get("Price"), "volume": b.get("Qty")} for b in board.get("Bids", [])[:5]],
                    "asks": [{"price": a.get("Price"), "volume": a.get("Qty")} for a in board.get("Asks", [])[:5]],
                    "executions": [
                        {
                            "time": datetime.now().strftime("%H:%M:%S"),
                            "price": board.get("CurrentPrice") or board.get("CalcPrice") or start_price,
                            "volume": board.get("CurrentPriceVolume", 100),
                            "type": "BUY" if board.get("CurrentPriceStatus") == 1 else "SELL"
                        }
                    ]
                }
            else:
                # API取得エラー時はフォールバックせずエラー終了
                print(f"[CRITICAL] 板情報の取得に失敗しました ({symbol})。kabuステーションの接続を確認してください。")
                import sys
                sys.exit(2)
        
        tick_stream.append(step_data)
        print(f" [{sec}s] 現在値: {step_data['current_price']}円")
        time.sleep(1)

    end_price = tick_stream[-1]["current_price"]
    print(f"ストリーム終了時価格: {end_price}円")

    # 3. 1分間待機してその後の推移を追う (結果の1分足)
    print("その後の値動きを追跡するため、60秒間待機します...")
    time.sleep(10) # 実際は60秒だが、開発・テスト用に少し短縮するか、または通常実行。ここではテストも考慮し10秒に縮め、値幅をシミュレート
    
    result_price = end_price
    if mock_mode:
        # ランダムに結果を決める
        result_dir = argparse_result_dir if 'argparse_result_dir' in globals() else None
        if not result_dir:
            import random
            result_dir = random.choice(['UP', 'DOWN', 'STAY'])
            
        if result_dir == 'UP':
            result_price = int(end_price * 1.003)
        elif result_dir == 'DOWN':
            result_price = int(end_price * 0.997)
        else:
            result_price = end_price
    else:
        # 本番では60秒待機後に再度ボード取得
        time.sleep(50)
        board = fetch_board_data(symbol, token)
        if board:
            result_price = board.get("CurrentPrice") or board.get("CalcPrice")
            if not result_price:
                print(f"[CRITICAL] 結果取得時に現在値が取得できませんでした。")
                import sys
                sys.exit(3)
        else:
            print(f"[CRITICAL] 結果の板情報取得に失敗しました。kabuステーションの接続を確認してください。")
            import sys
            sys.exit(3)

    price_change_ratio = round(((result_price - end_price) / end_price) * 100, 2)
    
    # 方向判定
    if price_change_ratio >= 0.2:
        answer_direction = 'UP'
    elif price_change_ratio <= -0.2:
        answer_direction = 'DOWN'
    else:
        answer_direction = 'STAY'

    print(f"結果現在値: {result_price}円 (変化率: {price_change_ratio}%) -> 判定: {answer_direction}")

    # 結果チャートデータの生成 (1分後の1分足を1本)
    result_chart_data = [{
        "time": (datetime.now() + timedelta(minutes=1)).strftime("%H:%M") if not mock_mode else datetime.now().strftime("%H:%M"),
        "open": end_price,
        "high": max(end_price, result_price) + int(end_price * 0.001),
        "low": min(end_price, result_price) - int(end_price * 0.001),
        "close": result_price,
        "volume": 25000
    }]

    # 4. 要約情報の作成 (Gemini API用プロンプト埋め込み用)
    ma5 = calculate_ma(initial_candles, 5)
    ma25 = calculate_ma(initial_candles, 25)

    is_golden_cross = False
    is_dead_cross = False

    # 直近の2本でクロスを判定 (28本目と29本目)
    if len(ma5) >= 30 and ma5[-2] is not None and ma25[-2] is not None and ma5[-1] is not None and ma25[-1] is not None:
        if ma5[-2] <= ma25[-2] and ma5[-1] > ma25[-1]:
            is_golden_cross = True
        elif ma5[-2] >= ma25[-2] and ma5[-1] < ma25[-1]:
            is_dead_cross = True

    current_price = initial_candles[-1]["close"]
    start_price = initial_candles[0]["close"]
    overall_up = current_price > start_price

    if is_golden_cross:
        initial_trend = "短期移動平均線(MA5)が中期移動平均線(MA25)を上抜けるゴールデンクロスが発生。"
    elif is_dead_cross:
        initial_trend = "短期移動平均線(MA5)が中期移動平均線(MA25)を下抜けるデッドクロスが発生。"
    else:
        ma5_val = ma5[-1]
        ma25_val = ma25[-1]
        if ma5_val is not None and ma25_val is not None:
            if ma5_val > ma25_val:
                if overall_up:
                    initial_trend = "短期移動平均線(MA5)が中期移動平均線(MA25)の上で推移する上昇傾向。"
                else:
                    initial_trend = "短期移動平均線(MA5)は中期移動平均線(MA25)の上にあるが、足元はもみ合い・調整局面。"
            else:
                if not overall_up:
                    initial_trend = "短期移動平均線(MA5)が中期移動平均線(MA25)の下で推移する下降傾向。"
                else:
                    initial_trend = "短期移動平均線(MA5)は中期移動平均線(MA25)の下にあるが、足元は反発局面。"
        else:
            initial_trend = "上昇傾向" if overall_up else "下降傾向"

    initial_chart_summary = f"{initial_trend}。直近30分終値: {start_price}円 -> {current_price}円"
    
    tick_stream_summary = f"開始時板比率: 売り厚め。10秒間で現在値が {tick_stream[0]['current_price']}円から{tick_stream[-1]['current_price']}円へ変化。"
    
    # 5. Gemini APIで解説文生成
    quiz_data = {
        "symbol": symbol,
        "name": name,
        "captured_at": datetime.now(timezone.utc).isoformat(),
        "pattern_type": "急騰" if answer_direction == 'UP' else "急落" if answer_direction == 'DOWN' else "レンジ",
        "initial_chart_data": initial_candles,
        "tick_stream_data": tick_stream,
        "answer_direction": answer_direction,
        "price_change_ratio": price_change_ratio,
        "result_chart_data": result_chart_data,
        "initial_chart_summary": initial_chart_summary,
        "tick_stream_summary": tick_stream_summary,
    }
    
    print("Gemini APIで要因解説を生成中...")
    explanation = generate_gemini_explanation(quiz_data)
    quiz_data["ai_explanation"] = explanation
    
    # 余分なメタデータを削除
    quiz_data.pop("initial_chart_summary", None)
    quiz_data.pop("tick_stream_summary", None)

    # 6. Supabaseに送信
    insert_to_supabase(quiz_data)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="TickTrainer Data Collector")
    parser.add_argument("--symbol", type=str, default="6526", help="銘柄コード (例: 6526, 6857, 9501, 7203)")
    parser.add_argument("--mock", action="store_true", help="kabuステーションAPIを使わず模擬データを生成する")
    parser.add_argument("--force-direction", type=str, choices=['UP', 'DOWN', 'STAY'], help="模擬データ生成時の結果を強制指定")
    
    args = parser.parse_args()
    
    # グローバルで結果方向を指定できるようにする (モック生成用)
    if args.force_direction:
        global argparse_result_dir
        argparse_result_dir = args.force_direction
        
    run_collection(args.symbol, mock_mode=args.mock)

import os
import time
import subprocess
from datetime import datetime, timezone, timedelta, time as dtime

# 対象銘柄 (トレードクイズの対象銘柄)
SYMBOLS = ["6526", "6857", "9501", "7203"]

# 日本時間 (JST) タイムゾーンの定義
JST = timezone(timedelta(hours=9))

def get_jst_now():
    """現在の日本時間を取得"""
    return datetime.now(JST)

def is_market_open(now_jst):
    """現在時刻が日本株市場の取引時間内であるかを判定 (平日 9:00-11:30, 12:30-15:00)"""
    # 土日 (5=土曜, 6=日曜) は取引時間外
    if now_jst.weekday() >= 5:
        return False
        
    current_time = now_jst.time()
    
    # 前場: 09:00 - 11:30 (念のため1分前から1分後まで余裕を持たせる)
    am_start = dtime(8, 59, 0)
    am_end = dtime(11, 31, 0)
    
    # 後場: 12:30 - 15:00 (念のため1分前から1分後まで余裕を持たせる)
    pm_start = dtime(12, 29, 0)
    pm_end = dtime(15, 1, 0)
    
    if am_start <= current_time <= am_end:
        return True
    if pm_start <= current_time <= pm_end:
        return True
        
    return False

def main():
    print("==================================================")
    print("       TickTrainer 自動データ収集スクリプト        ")
    print("==================================================")
    print(f"・対象銘柄: {', '.join(SYMBOLS)}")
    print("・動作条件: 平日 9:00-11:30, 12:30-15:00 (日本時間)")
    print("・収集間隔: 10分ごとに銘柄をローテーションで収集")
    print("--------------------------------------------------")
    print("※ 実行には kabuステーション が起動しており、")
    print("   API接続が有効化されている必要があります。")
    print("※ 終了するには Ctrl+C を押してください。")
    print("==================================================")
    
    interval_minutes = 10
    index = 0
    
    while True:
        now_jst = get_jst_now()
        
        if is_market_open(now_jst):
            symbol = SYMBOLS[index]
            print(f"\n[{now_jst.strftime('%Y-%m-%d %H:%M:%S')} JST] データ収集を開始します (銘柄: {symbol})...")
            
            # collect.py の呼び出し
            try:
                # 同一ディレクトリの collect.py を実行
                script_dir = os.path.dirname(os.path.abspath(__file__))
                collect_script = os.path.join(script_dir, "collect.py")
                
                # subprocess を使用して collect.py を実行 (リアルタイムに出力を流す)
                result = subprocess.run(
                    ["python", collect_script, "--symbol", symbol]
                )
                
                # 実行結果を判定
                if result.returncode != 0:
                    print(f"[CRITICAL] collect.py が異常終了しました (終了コード: {result.returncode})")
                    print("[CRITICAL] kabuステーションとの接続エラーを検知したため、自動データ収集を停止します。")
                    print("[CRITICAL] kabuステーションが起動しログインしていることを確認し、再起動してください。")
                    import sys
                    sys.exit(1)
                    
            except Exception as e:
                print(f"[ERROR] スクリプトの実行中に致命的なエラーが発生しました: {e}")
            
            # 次の銘柄に進む
            index = (index + 1) % len(SYMBOLS)
            
            print(f"次の収集まで {interval_minutes} 分間待機します...")
            time.sleep(interval_minutes * 60)
            
        else:
            # 取引時間外
            print(f"\r[{now_jst.strftime('%Y-%m-%d %H:%M:%S')} JST] 現在は日本株市場の取引時間外です。待機中...", end="", flush=True)
            # 1分ごとに再確認
            time.sleep(60)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n[INFO] 自動収集スクリプトを終了しました。")

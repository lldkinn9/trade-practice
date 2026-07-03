@echo off
cd /d "%~dp0"
echo ==========================================
echo [INFO] Starting TickTrainer Auto Data Collector...
echo ==========================================
python auto_collector.py
pause

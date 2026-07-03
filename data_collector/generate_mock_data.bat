@echo off
cd /d "%~dp0"
echo ==========================================
echo [INFO] Generating Mock Quiz Data...
echo ==========================================

:: 6526
python collect.py --mock --symbol 6526 --force-direction UP
python collect.py --mock --symbol 6526 --force-direction DOWN
python collect.py --mock --symbol 6526 --force-direction STAY

:: 6857
python collect.py --mock --symbol 6857 --force-direction UP
python collect.py --mock --symbol 6857 --force-direction DOWN
python collect.py --mock --symbol 6857 --force-direction STAY

:: 9501
python collect.py --mock --symbol 9501 --force-direction UP
python collect.py --mock --symbol 9501 --force-direction DOWN
python collect.py --mock --symbol 9501 --force-direction STAY

:: 7203
python collect.py --mock --symbol 7203 --force-direction UP
python collect.py --mock --symbol 7203 --force-direction DOWN
python collect.py --mock --symbol 7203 --force-direction STAY

echo ==========================================
echo [SUCCESS] Mock Quiz Data Generation Completed!
echo ==========================================
pause

@echo off
chcp 65001 > nul
title 실험 보조 계산기 서버 구동기

echo ===================================================
echo  실험 보조 계산기 로컬 서버 구동을 시작합니다.
echo ===================================================

:: Autodesk 설치 폴더 내 Python 실행 경로 지정
set "AUTODESK_PYTHON=C:\Users\Dohui\AppData\Local\Autodesk\webdeploy\production\09c0b27154daf1d1e28796415439b91cda785e24\Python\python.exe"

if exist "%AUTODESK_PYTHON%" (
    echo [정보] Autodesk 내장 Python을 감지하여 서버를 기동합니다.
    "%AUTODESK_PYTHON%" "%~dp0start_server.py"
) else (
    echo [정보] 시스템 기본 python을 사용하여 서버를 기동합니다.
    python "%~dp0start_server.py"
)

pause

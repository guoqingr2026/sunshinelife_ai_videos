@echo off
chcp 65001 >nul
cd /d "%~dp0"

title 关闭 - 动画生产系统

echo 正在关闭服务并释放端口 3000 / 3001 ...
echo.

REM 关闭 Learnv 启动窗口（含 concurrently 子进程）
taskkill /FI "WINDOWTITLE eq Learnv-动画生产系统*" /T /F >nul 2>&1

REM 用独立 ps1 脚本释放端口（避免 bat 内嵌 PowerShell 转义错误）
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\stop-ports.ps1"
set "STOP_CODE=%ERRORLEVEL%"

echo.
if "%STOP_CODE%"=="0" (
    echo [OK] 关闭完成。
) else (
    echo [WARN] 部分端口可能仍被占用，可尝试以管理员身份运行本脚本。
)

echo.
pause
exit /b %STOP_CODE%

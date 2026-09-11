@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion
cd /d "%~dp0"

title 启动 - 动画生产系统

call "%~dp0scripts\load_proxy_env.bat"

where pnpm >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到 pnpm，请先安装 Node.js 并执行: corepack enable
    pause
    exit /b 1
)

echo 检查依赖...
if not exist "node_modules\.pnpm" (
    echo 正在安装依赖（使用镜像与代理）...
    call pnpm install
    if errorlevel 1 (
        echo [错误] 依赖安装失败，请检查网络或代理设置（scripts\load_proxy_env.bat）
        pause
        exit /b 1
    )
)

call "%~dp0scripts\ensure_esbuild.bat"

if not exist "remotion\node_modules\remotion" (
    echo 正在安装 Remotion 依赖...
    call pnpm install --filter remotion
)

echo 清理端口 3000 / 3001 上的旧进程...
taskkill /FI "WINDOWTITLE eq Learnv-动画生产系统*" /T /F >nul 2>&1
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\stop-ports.ps1" >nul 2>&1
timeout /t 1 /nobreak >nul

echo.
echo 正在启动服务...
echo   前端  http://localhost:3000
echo   后端  http://localhost:3001
echo.
echo 关闭请运行 关闭.bat
echo.

start "Learnv-动画生产系统" cmd /k "call "%~dp0scripts\load_proxy_env.bat" && pushd "%~dp0" && pnpm dev"

timeout /t 2 /nobreak >nul
echo 已在新窗口启动。
pause
endlocal

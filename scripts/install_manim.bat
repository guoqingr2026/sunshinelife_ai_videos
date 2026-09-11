@echo off
chcp 65001 >nul
echo ========================================
echo   安装 Manim（使用 py -3）
echo ========================================
echo.

py -3 --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到 py -3，请先安装 Python 3:
    echo   https://www.python.org/downloads/
    pause
    exit /b 1
)

echo 当前 Python:
py -3 --version
echo.

echo 正在安装 manim（可能需要几分钟）...
py -3 -m pip install --upgrade pip
py -3 -m pip install -r "%~dp0..\manim\requirements.txt"

if errorlevel 1 (
    echo.
    echo [错误] 安装失败，常见原因:
    echo   1. 缺少 C++ 编译环境 - 安装 Visual Studio Build Tools:
    echo      https://visualstudio.microsoft.com/visual-cpp-build-tools/
    echo      勾选「使用 C++ 的桌面开发」
    echo   2. Python 3.14 过新，部分依赖无预编译包
    echo      建议额外安装 Python 3.12: https://www.python.org/downloads/
    echo      然后用: py -3.12 -m pip install manim
    pause
    exit /b 1
)

echo.
echo 验证安装:
py -3 -m manim --version
echo.
echo [完成] 请重启 Learnv（关闭.bat -^> 启动.bat）后再生成 Manim 动画。
pause

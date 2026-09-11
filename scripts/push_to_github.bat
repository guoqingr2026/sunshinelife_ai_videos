@echo off
chcp 65001 >nul
echo ========================================
echo   推送到 GitHub — sunshinelife_ai_videos
echo ========================================
echo.
echo 若尚未创建仓库，请先打开:
echo   https://github.com/new
echo 仓库名: sunshinelife_ai_videos
echo 不要勾选「Add README」（保持空仓库）
echo.
set /p REPO_URL=请输入仓库 HTTPS 地址 (回车使用默认 guoqingr2026): 
if "%REPO_URL%"=="" set REPO_URL=https://github.com/guoqingr2026/sunshinelife_ai_videos.git
git remote remove origin 2>nul
git remote add origin %REPO_URL%
git branch -M main
echo.
echo 推送 main 分支和 v1.0 标签...
git push -u origin main
git push origin v1.0
echo.
echo 完成。仓库地址: %REPO_URL%
pause

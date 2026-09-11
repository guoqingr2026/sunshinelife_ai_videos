@echo off
REM 网络代理（与 Sunshine life AI Voice 项目一致，可按本机修改）
set "HTTP_PROXY=http://87.254.212.121:8080"
set "HTTPS_PROXY=http://87.254.212.121:8080"
set "http_proxy=%HTTP_PROXY%"
set "https_proxy=%HTTPS_PROXY%"
set "NO_PROXY=localhost,127.0.0.1"

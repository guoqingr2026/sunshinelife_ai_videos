@echo off
setlocal EnableDelayedExpansion
set "ROOT=%~dp0.."
cd /d "%ROOT%"

for /d %%i in ("%ROOT%\node_modules\.pnpm\esbuild@*") do (
  if exist "%%i\node_modules\esbuild\install.js" (
    node "%%i\node_modules\esbuild\install.js" >nul 2>&1
  )
)
endlocal

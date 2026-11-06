@echo off
cd /d "%~dp0"
set "VOCATUS_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if exist "%VOCATUS_NODE%" (
  "%VOCATUS_NODE%" restablecer-admin.mjs %*
) else (
  node restablecer-admin.mjs %*
)
pause

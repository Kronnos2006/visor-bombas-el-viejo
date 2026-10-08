@echo off
cd /d "%~dp0"
set "VOCATUS_DEMO=1"
set "VOCATUS_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if exist "%VOCATUS_NODE%" (
  "%VOCATUS_NODE%" server.mjs
) else (
  node server.mjs
)
pause

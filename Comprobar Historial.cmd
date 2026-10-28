@echo off
cd /d "%~dp0"
node "visor-bombas\tools\proteger-historial.mjs" %*
set "guard_exit=%errorlevel%"
pause
exit /b %guard_exit%

@echo off
cd /d "%~dp0"
node "00-Proyecto\scripts\auditar-visor.mjs" %*
set "audit_exit=%errorlevel%"
echo.
echo La auditoria termino. El informe indica que controles pasaron y que falta revisar.
pause
exit /b %audit_exit%

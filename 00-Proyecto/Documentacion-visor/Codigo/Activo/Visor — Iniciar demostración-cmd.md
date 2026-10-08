# Visor/Iniciar demostración.cmd

Archivo del visor: Iniciar demostración.cmd

**Categoría:** Activo. **Captura:** 2026-10-07.

Original: [abrir archivo](<<RUTA-LOCAL>/vocatus/auto cad/visor-bombas/Iniciar demostración.cmd>).

SHA-256: `8cbe7df5ab309d817b326863f1163f9de59dfd82f6a6386b44a1ff593623a076`

Esta es una copia documental. Editar el original para cambiar el programa.

````bat
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

````

# Visor/Iniciar datos reales.cmd

Archivo del visor: Iniciar datos reales.cmd

**Categoría:** Activo. **Captura:** 2026-10-07.

Original: [abrir archivo](<C:/Users/Isabella GM/vocatus/auto cad/visor-bombas/Iniciar datos reales.cmd>).

SHA-256: `c6b9450b35db338b1d619864292fbbd1f8f3009a38bcb36d42853c9c2df9247f`

Esta es una copia documental. Editar el original para cambiar el programa.

````bat
@echo off
cd /d "%~dp0"
set "VOCATUS_DEMO=0"
set "VOCATUS_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if exist "%VOCATUS_NODE%" (
  "%VOCATUS_NODE%" server.mjs
) else (
  node server.mjs
)
pause

````

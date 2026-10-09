---
actualizado: 2026-10-07
estado: documentacion
---

# Índice de código y fuentes

36 archivos preservados. El código propio aparece completo dentro de notas legibles en Obsidian; las dependencias están disponibles como archivos originales. [Manifiesto de integridad](manifiesto-fuentes.json).

La copia no se actualiza sola. Original activo: C:/Users/Isabella GM/vocatus/auto cad/visor-bombas.

## Archivo

- [[Codigo/Archivo/Adjuntos-historicos — exportador-guarda-demo-py|Adjuntos-historicos/exportador-guarda-demo.py]] — Versión adjunta con guarda demo y fallo posterior por activos[0]; reemplazada por el script local.
- [[Codigo/Archivo/Adjuntos-historicos — exportador-inicial-py|Adjuntos-historicos/exportador-inicial.py]] — Versión adjunta inicial: hash no estable y otras limitaciones históricas.
- [[Codigo/Archivo/Visor — archivo — auditorias — auditar_exportador-py|Visor/archivo/auditorias/auditar_exportador.py]] — Archivo del visor: archivo/auditorias/auditar_exportador.py
- [[Codigo/Archivo/Visor — archivo — parches — fix-selection-mjs|Visor/archivo/parches/fix-selection.mjs]] — Archivo del visor: archivo/parches/fix-selection.mjs
- [[Codigo/Archivo/Visor — archivo — parches — update-demo-mjs|Visor/archivo/parches/update-demo.mjs]] — Archivo del visor: archivo/parches/update-demo.mjs
- [Visor/archivo/README.md](<Fuentes/Visor/archivo/README.md>) — Archivo del visor: archivo/README.md
- [[Codigo/Archivo/Visor — archivo — respaldos — app-js-respaldo|Visor/archivo/respaldos/app.js.respaldo]] — Archivo del visor: archivo/respaldos/app.js.respaldo

## Scripts-Obsidian

- [[Codigo/Scripts-Obsidian/Scripts-Obsidian — consultar_bombas-py|Scripts-Obsidian/consultar_bombas.py]] — Consulta CLI anterior; no es el backend del visor.
- [[Codigo/Scripts-Obsidian/Scripts-Obsidian — crear_notas_bombas-py|Scripts-Obsidian/crear_notas_bombas.py]] — Generador de fichas a partir de CSV; conserva notas existentes.
- [[Codigo/Scripts-Obsidian/Scripts-Obsidian — exportar_cmms-py|Scripts-Obsidian/exportar_cmms.py]] — Exportador independiente; ver limitaciones de integración.
- [[Codigo/Scripts-Obsidian/Scripts-Obsidian — extract_tags-py|Scripts-Obsidian/extract_tags.py]] — Herramienta de extracción DWG con rutas del entorno Linux original.

## Datos-demo

- [Visor/demo-vault/00-Proyecto/bombas/P-9001.md](<Fuentes/Visor/demo-vault/00-Proyecto/bombas/P-9001.md>) — Archivo del visor: demo-vault/00-Proyecto/bombas/P-9001.md
- [Visor/demo-vault/00-Proyecto/bombas/P-9002.md](<Fuentes/Visor/demo-vault/00-Proyecto/bombas/P-9002.md>) — Archivo del visor: demo-vault/00-Proyecto/bombas/P-9002.md
- [Visor/demo-vault/Documentos/LEER-DEMOSTRACION.md](<Fuentes/Visor/demo-vault/Documentos/LEER-DEMOSTRACION.md>) — Archivo del visor: demo-vault/Documentos/LEER-DEMOSTRACION.md

## Activo

- [[Codigo/Activo/Visor — Iniciar datos reales-cmd|Visor/Iniciar datos reales.cmd]] — Archivo del visor: Iniciar datos reales.cmd
- [[Codigo/Activo/Visor — Iniciar demostración-cmd|Visor/Iniciar demostración.cmd]] — Archivo del visor: Iniciar demostración.cmd
- [[Codigo/Activo/Visor — Iniciar visor-cmd|Visor/Iniciar visor.cmd]] — Archivo del visor: Iniciar visor.cmd
- [[Codigo/Activo/Visor — package-json|Visor/package.json]] — Archivo del visor: package.json
- [[Codigo/Activo/Visor — public — app-js|Visor/public/app.js]] — Interfaz, escenas Three.js, selección de equipos, panel e interacción.
- [[Codigo/Activo/Visor — public — index-html|Visor/public/index.html]] — Estructura de la página, paneles y diálogos.
- [[Codigo/Activo/Visor — public — plant-layout-js|Visor/public/plant-layout.js]] — Distribución geométrica de tanques y bombas sin superposición.
- [[Codigo/Activo/Visor — public — realismo-js|Visor/public/realismo.js]] — Capa de iluminación, entorno, materiales PBR y sombras de Claude.
- [[Codigo/Activo/Visor — public — style-css|Visor/public/style.css]] — Estilos, diseño adaptable e impresión.
- [Visor/README.md](<Fuentes/Visor/README.md>) — Archivo del visor: README.md
- [[Codigo/Activo/Visor — server-mjs|Visor/server.mjs]] — Servidor HTTP, lectura de bóveda, documentos, informes y Gemini.

## Dependencias

- [Visor/public/vendor/OrbitControls.js](<Fuentes/Visor/public/vendor/OrbitControls.js>) — Dependencia de terceros; fuente completa preservada con su licencia.
- [Visor/public/vendor/THREE-LICENSE.txt](<Fuentes/Visor/public/vendor/THREE-LICENSE.txt>) — Dependencia de terceros; fuente completa preservada con su licencia.
- [Visor/public/vendor/three.module.js](<Fuentes/Visor/public/vendor/three.module.js>) — Dependencia de terceros; fuente completa preservada con su licencia.
- [Visor/vendor/js-yaml.mjs](<Fuentes/Visor/vendor/js-yaml.mjs>) — Dependencia de terceros; fuente completa preservada con su licencia.
- [Visor/vendor/YAML-LICENSE.txt](<Fuentes/Visor/vendor/YAML-LICENSE.txt>) — Dependencia de terceros; fuente completa preservada con su licencia.

## Herramientas

- [[Codigo/Herramientas/Visor — setup-mjs|Visor/setup.mjs]] — Descarga de dependencias con versiones fijadas.
- [[Codigo/Herramientas/Visor — tools — documentar-mjs|Visor/tools/documentar.mjs]] — Archivo del visor: tools/documentar.mjs
- [[Codigo/Herramientas/Visor — tools — verificar-exportador-py|Visor/tools/verificar-exportador.py]] — Archivo del visor: tools/verificar-exportador.py

## Pruebas

- [[Codigo/Pruebas/Visor — test-demo-mjs|Visor/test-demo.mjs]] — Prueba de demostración y registro de informes aislados.
- [[Codigo/Pruebas/Visor — test-layout-mjs|Visor/test-layout.mjs]] — Prueba de separación geométrica y plataforma.
- [[Codigo/Pruebas/Visor — test-mjs|Visor/test.mjs]] — Pruebas del servidor con las fichas reales.

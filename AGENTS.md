# Proyecto Vocatus

Subir los cambios comprobados del proyecto a https://github.com/Kronnos2006/visor-bombas-el-viejo.git, según la instrucción persistente del usuario. Comprobar el remoto y conservar los cambios existentes; no hacer push forzado. Informar si una subida queda pendiente.

El código ejecutable está en `visor-bombas`. En la instalación local, los lanzadores detectan la bóveda `Vacatos`; `OBSIDIAN_VAULT` permite seleccionar otra carpeta explícitamente. Las copias de código dentro de notas de Obsidian son documentación, no la aplicación activa.

No subir credenciales, informes reales de mantenimiento ni adjuntos privados. Respetar `.gitignore`. Mantener separadas las fichas documentales y los ejemplos DEMO.

Para cambios en el visor ejecutar `npm test`. Para cambios del exportador ejecutar también `python -B 00-Proyecto/scripts/test_exportar_cmms.py`. Las pruebas de persistencia deben usar bóvedas de prueba, nunca crear intervenciones ficticias en una bóveda real.

Para actualizaciones del visor, seguir la verificación de despliegue y fotos compartidas en [la auditoría B1–B83](00-Proyecto/auditorias/2026-11-11-fotos-b1-b83.md). Revisar claves por bomba, dominio de producción y lectura desde una segunda cuenta autorizada.

Cambios del 11 y 12 de noviembre de 2026 (tareas, avisos, editor de diseño, estadísticas, SQL aplicados y errores a no repetir): [documentación](00-Proyecto/Documentacion-visor/23-Tareas-avisos-diseno-y-estadisticas-2026-11-12.md).

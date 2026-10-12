# Proyecto Vocatus

Subir los cambios comprobados del proyecto a https://github.com/Kronnos2006/visor-bombas-el-viejo.git, según la instrucción persistente del usuario. Comprobar el remoto y conservar los cambios existentes; no hacer push forzado. Informar si una subida queda pendiente.

El código ejecutable está en `visor-bombas`. En la instalación local, los lanzadores detectan la bóveda `Vacatos`; `OBSIDIAN_VAULT` permite seleccionar otra carpeta explícitamente. Las copias de código dentro de notas de Obsidian son documentación, no la aplicación activa.

No subir credenciales, informes reales de mantenimiento ni adjuntos privados. Respetar `.gitignore`. Mantener separadas las fichas documentales y los ejemplos DEMO.

Para cambios en el visor ejecutar `npm test`. Para cambios del exportador ejecutar también `python -B 00-Proyecto/scripts/test_exportar_cmms.py`. Las pruebas de persistencia deben usar bóvedas de prueba, nunca crear intervenciones ficticias en una bóveda real.

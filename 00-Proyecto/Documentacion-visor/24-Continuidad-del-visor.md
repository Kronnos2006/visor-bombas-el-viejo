# Continuidad de Vocatus · 23 de noviembre de 2026

La URL operativa es [Visor de Planta El Viejo](https://visor-bombas-el-viejo.vercel.app/). La rama de continuidad es `main`. La [revisión de B1–B90](https://github.com/Kronnos2006/visor-bombas-el-viejo/pull/8) quedó integrada en `d5aa331` y completó el [despliegue en Vercel](https://vercel.com/kronnos2006s-projects/visor-bombas-el-viejo/F8BawrZJyrZ3Ld998PA4h7Ka63gK).

## Dónde trabajar

| Área | Punto de entrada |
| --- | --- |
| Ficha, pestañas y escena 3D | [app.js](../../visor-bombas/public/app.js) |
| Navegación y reportes móviles | [telefono-app.js](../../visor-bombas/public/telefono-app.js) |
| Inventario y mapa de B1–B90 | [asignacion-bombas.json](../../visor-bombas/public/modelos/asignacion-bombas.json) |
| Lectura de placas y resolución de conflictos | [placas-bombas.json](../../visor-bombas/public/modelos/placas-bombas.json) e [identidad-bomba.js](../../visor-bombas/public/identidad-bomba.js) |
| Selección de catálogos y CAD | [expediente.js](../../visor-bombas/public/expediente.js) y [referencias por bomba](../../visor-bombas/public/referencias/bombas/) |
| Geometría de referencia | [pump-reference.js](../../visor-bombas/public/pump-reference.js) y [assets 3D](../../visor-bombas/public/modelos/) |
| API, mantenimiento y Gemini | [server.mjs](../../visor-bombas/server.mjs) |
| Configuración de publicación | [vercel.json](../../visor-bombas/vercel.json) |
| Esquema y verificación de datos compartidos | [supabase/](../../supabase/) |
| Normas del proyecto | [AGENTS.md](../../AGENTS.md) |

## Qué está verificado

- Las 90 bombas usan el mismo flujo de ficha. La pestaña Historial del equipo muestra su registro de mantenimiento. Reportar se reinicia al entrar y completa el responsable de la sesión.
- Hay 64 TAG con documentación asociada y 26 pendientes. La [auditoría por TAG](../auditorias/2026-11-23-b1-b90.txt) registra la identidad, su evidencia, el perfil visual y la documentación. Fue una revisión de archivos. La correspondencia física requiere verificar la placa y el equipo en planta.
- B17, B18, B20 y B21 tienen placas Titan 4196 ST, aunque el inventario las anotó como Durco. B19 conserva Durco LF-82. B39–B43 tienen documentación de familia e-SH; falta distinguir 15SH06 de 02SH06. B48 mantiene el 3D detallado y B51/B52 muestran exterior con el despiece pendiente. Hay cruces históricos sin confirmar en B57–B62.
- Gemini funcionó en producción en una consulta autorizada con B22. Las 90 llamadas posteriores se simularon y verificaron el contexto que se prepara por TAG. La consulta usa el inventario actual y conserva los reportes por TAG. Ante una ficha histórica incompatible, el contexto evita adjuntar su historial antiguo.
- El cambio de B1–B90 pasó 366 pruebas automatizadas y 58 comprobaciones de interfaz con un servidor local aislado.

## Ejecutar y verificar

Los comandos se ejecutan desde la raíz. Se usó Node 24 y el repositorio tiene un archivo de bloqueo de npm.

```sh
npm ci
npm test
```

Para ejecutar la aplicación con datos DEMO en una terminal POSIX:

```sh
VOCATUS_DEMO=1 npm run dev
```

En PowerShell:

```powershell
$env:VOCATUS_DEMO = '1'
npm run dev
```

El servidor escucha normalmente en `http://127.0.0.1:8766`. Para las pruebas de navegador, prepara Playwright y ejecuta `npm run test:ui`. El script admite `PLAYWRIGHT_MODULE`, `BROWSER_EXECUTABLE` y `UI_SCREENSHOTS_DIR` para usar una instalación y carpeta de salida concretas. Para probar los exportadores consulta el [README](../../README.md) y usa una bóveda de prueba.

## Operación y siguientes pendientes

1. Confirmar en planta los TAG marcados pendientes y fotografiar placa, bomba e identificación del lugar. Actualizar juntos el dato documental, el catálogo y la representación cuando haya evidencia.
2. Validar la lectura de los reportes y de las fotos compartidas desde una segunda cuenta autorizada. Para la bóveda local, `OBSIDIAN_VAULT` permite elegir la fuente de datos. Los cambios de Supabase requieren revisar el esquema y las políticas antes de probarlos con datos reales.
3. La clave `GEMINI_API_KEY` se define como variable de producción en Vercel. `GEMINI_MODEL` permite configurar el modelo. Verifica el despliegue tras cambiar una variable. Si Gemini vuelve a fallar, revisa el estado del despliegue y el error de la función sin publicar la clave ni los cuerpos de las consultas.
4. Acordar quién administrará GitHub, Vercel y los datos cuando termine la práctica, y qué cuentas tendrán acceso. Véase [Entrega y continuidad](10-Entrega-y-continuidad.md).

## Respaldo de la copia local antigua

La [rama de respaldo](https://github.com/Kronnos2006/visor-bombas-el-viejo/tree/codex/respaldo-local-visor) conserva seis commits antiguos de portada, Historial, vista 3D y fotos, además de una propuesta local para dos posiciones sin TAG junto a ventiladores. Si alguna de estas mejoras hace falta, compárala con `main` y adapta solo la parte correspondiente. La rama guarda el estado de aquella copia para referencia y se verifica por separado.

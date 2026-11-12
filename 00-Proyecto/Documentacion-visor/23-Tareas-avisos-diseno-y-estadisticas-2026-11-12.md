# Cambios del visor · 11 y 12 de noviembre de 2026

Producción: https://visor-bombas-el-viejo.vercel.app, desde `main` en `2ddfdb2`. Todo pasó primero por la rama de prueba `codex/cuentas-vercel` y se publicó por avance directo, sin push forzado y con permiso del usuario. `npm test`: 351 pruebas pasan.

Este documento no contiene claves.

---

## 1. Resumen para el usuario

| Qué | Dónde se ve |
|---|---|
| Todas las bombas abren con la **misma ficha** que B31: Datos y fotos → Resumen de la bomba → placa, Excel y fotos | Ficha de cualquier bomba |
| **Ver bomba en 3D** y **Vista explosionada** también en las bombas sin ficha completa | Ficha |
| **Buscador** con las 80 bombas y lista de resultados debajo | Áreas |
| **Ocultar nombres** y **Bombas** pasan a «Herramientas», ya no flotan sobre el 3D | Áreas → Herramientas |
| **Techo transparente** en la nave de calderas (se ven B67, B70, B73, B74, B75, B76) | 3D, «Calderas y nave» |
| **Editor de diseño** (solo administrador): colores, textos, ocultar, ordenar, logo y botones extra del menú | Menú de la cuenta → «Editar diseño» (`/diseno.html`) |
| **Datos de máquina** que se escriben en la ficha se comparten con todo el equipo en tiempo real | Ficha → «Editar datos» |
| **Órdenes de trabajo**: solo el administrador crea, edita y borra; elige responsable o **«Para todos»** | Pendientes → Trabajos programados |
| **«✋ Aceptar orden»**: la primera persona que acepta una orden «Para todos» queda como responsable | Tarjeta de la orden |
| **«⚠ Avisar un problema»**: cualquier usuario reporta una máquina en mal estado o algo que pasó en planta | Pendientes → Reportes de problemas |
| **Campana 🔔** con avisos en tiempo real (y avisos del navegador, si se activan) | Encabezado |
| **Lista de equipos B1→B83** y botón **«📍 Elegir en el 3D»** | Formularios de orden y de aviso |
| **Reparaciones y trabajos**: gráficos de bombas más reparadas, problemas que se repiten, repuestos, órdenes por tipo y trabajos por mes | Pendientes (reemplaza «Revisión de fichas») |
| Las pantallas **se actualizan solas** cuando alguien borra, acepta, inicia o cierra un trabajo | Pendientes |
| **Bodega quitada** (no funcionaba en línea) y sin botón «Pedir repuestos» | Barra: Áreas · Pendientes · Historial · Reportar |

---

## 2. Base de datos (Supabase `gtfqhljbxyanfyrarykw`)

SQL aplicados el 12 de noviembre con permiso del usuario. Los archivos están en `supabase/migrations/`. Todos agregan; ninguno borra datos de bombas, fotos, órdenes ni informes.

| Archivo | Qué crea |
|---|---|
| `20261111120000_vocatus_pump_data.sql` | Tabla `vocatus_pump_data` (datos de máquina de la ficha), con RLS y tiempo real. También agrega tiempo real a `vocatus_pump_names`. |
| `20261111140000_vocatus_site_design.sql` | Tabla `vocatus_site_design` (una sola fila, `principal`). La leen las cuentas aprobadas; solo la guarda un administrador (`vocatus_access.current_is_admin()`). |
| `20261112120000_vocatus_tareas_y_avisos.sql` | `vocatus_team()` (cuentas activas); tablas `vocatus_notifications` (avisos) y `vocatus_incidents` (reportes de planta); disparadores de avisos; columnas `archived_at`/`archived_by` en órdenes; `vocatus_delete_work_order`; nueva `vocatus_save_work_order` (solo el administrador crea o edita; los demás solo inician la orden que tienen asignada). |
| `20261112150000_vocatus_ordenes_para_todos.sql` | Opción «Para todos» (`abierta`): `notify_all`, `vocatus_accept_work_order` (bloquea la fila, así que gana solo la primera persona) y avisos de «aceptó la orden». |
| `20261112170000_vocatus_rendimiento.sql` | Los 7 índices que pedía el revisor de Supabase, un índice para los avisos sin leer, limpieza automática de avisos viejos (leídos de más de 90 días o cualquiera de más de 1 año; solo avisos) y tiempo real en `vocatus_work_reports`. |

### Quién puede hacer qué (lo controla la base, no solo la pantalla)

| Acción | Usuario | Administrador |
|---|---|---|
| Ver órdenes | Sí | Sí |
| Crear, editar o borrar (archivar) órdenes | No | Sí |
| Iniciar una orden | Solo la suya, o una antigua sin responsable de la lista | Sí |
| Aceptar una orden «Para todos» | Sí (la primera persona gana) | Sí |
| Cerrar con informe | Sí (igual que antes) | Sí |
| Enviar un reporte de planta | Sí | Sí |
| Ver reportes | Solo los suyos | Todos |
| Marcar un reporte como revisado o resuelto | No | Sí |
| Avisos | Solo los propios; los crean solo los disparadores | Igual |
| Guardar el diseño del sitio | No | Sí |

### Avisos automáticos (disparadores)

- Reporte nuevo → a todos los administradores.
- Reporte revisado o resuelto → a quien lo envió.
- Orden asignada → al responsable.
- Orden «Para todos» → a todas las cuentas activas.
- Orden aceptada, iniciada o cerrada → a los administradores.
- Orden borrada → a su responsable.

### Tiempo real activo

`vocatus_photos`, `vocatus_pump_names`, `vocatus_pump_data`, `vocatus_site_design`, `vocatus_notifications`, `vocatus_incidents`, `vocatus_work_orders` y `vocatus_work_reports`.

---

## 3. Archivos del visor (`visor-bombas/public/`)

| Archivo | Para qué |
|---|---|
| `pump-data.js` | Datos de máquina compartidos (cola sin señal, tiempo real para datos y nombres). |
| `diseno-core.js`, `diseno.js`, `diseno-editor.js`, `diseno.html` | Editor de diseño. `diseno-core.js` tiene la lista de piezas editables (barra `#tel-barra`, panel de áreas, pestañas de la ficha) y valida todo: colores en hex, textos planos y enlaces https o de la propia página. |
| `ficha-pendiente.js` + `app.js` | Ficha igual para las bombas sin ficha completa (`bombaParaResumen`, `paintPumpSummary(p,{pendiente:true})`). Las fotos siguen guardándose por **lugar** (`fotoKey`). |
| `tareas-avisos.js` | Campana, reportes de planta, responsable de la lista o «Para todos», «Aceptar orden», «Borrar orden», «Elegir en el 3D», lista de equipos B1→B83 y actualización automática de las pantallas. |
| `estadisticas.js` | Gráficos de Pendientes. Lee el formato real de los informes (`title`, `symptoms`, `text`, `parts` como texto, `retirado`). |
| `cloud-workflow.js` | Filtra las órdenes archivadas; agrega `deleteOrder` y `acceptOrder`. |
| `telefono-app.js` / `.css` | Buscador con todas las bombas; paleta en Herramientas; Pendientes sin el recuadro vacío; Bodega oculta (`oculta: true`); barra de 4 botones. |
| `vercel.json` | `X-Frame-Options: SAMEORIGIN` (antes `DENY`), para que la vista previa del editor funcione. Otros sitios siguen sin poder mostrar el visor. |

Pruebas nuevas: `test-pump-data.mjs`, `test-diseno.mjs`, `test-ficha-igual.mjs`, `test-tareas-avisos.mjs` y `test-estadisticas.mjs`.

---

## 4. Errores encontrados y cómo se evitaron (para no repetirlos)

1. **Producción tenía cambios que la rama no tenía** (arreglo de fotos de B76 y auditoría). Siempre: `git fetch`, revisar `git merge-base --is-ancestor origin/main origin/codex/cuentas-vercel` y, si no es ancestro, **juntar `main` en la rama** antes de publicar. Nunca forzar.
2. **El visor reescribe su propia dirección** (`?s=areas`) y borra parámetros como `?diseno=vista`. La vista previa del editor se detecta porque está dentro de un marco de `/diseno.html`, no por la dirección.
3. **El diseño real del visor es el de `body.app-tel`** (barra lateral `#tel-barra`), en PC y en celular. El menú viejo `.main-nav` está siempre oculto: no sirve como objetivo de ningún cambio.
4. **El 3D cambia la página todo el tiempo** (etiquetas). No esperar a que «se quede quieta»: aplicar como máximo cada cierto tiempo y solo escribir lo que cambió.
5. **Pendientes carga sin el 3D**: la lista de bombas sale de `modelos/asignacion-bombas.json` (`lista` A + N), no de las referencias del 3D.
6. **Los informes guardados en la nube no usan los mismos campos** que el formulario. Leer los dos formatos y proteger los gráficos con try/catch.
7. **Las funciones SQL `security invoker` no pueden leer `vocatus_access.accounts`**: usar funciones `security definer` pequeñas (`account_name`, `active_account_name`).
8. **No dejar código que se ejecute al cargar si usa `document`**: rompe las pruebas en Node. Encerrarlo en `if(typeof document!=='undefined')`.
9. **Los módulos importados con distinta `?v=` son instancias distintas.** `fotos-bomba.js` y `ficha-pendiente.js` usan `?v=20261111-fotos-v2` en todos lados; no cambiar una sola.

---

## 5. Verificación después de publicar (además de `COMO-AUDITAR-VISOR.md`)

1. En https://visor-bombas-el-viejo.vercel.app, revisar en el código fuente las versiones: `app.js?v=20261112-techo`, `telefono-app.js?v=movil-20261112d`, `tareas-avisos.js?v=20261112h` y `diseno.js?v=diseno-20261112a`.
2. Con la consola de la página: `(await import('/cloud-surveys.js')).surveyConnection()` → `client.getChannels()` debe dar 4 canales en estado `joined`.
3. Pendientes: la campana visible, «Avisar un problema» activo y los gráficos cargados.
4. Probar con **dos cuentas**:
   - el administrador crea una orden «Para todos» y la otra cuenta la acepta;
   - revisar que llegan los avisos y que la lista se actualiza sola.

---

## 6. Pendientes

- **Supabase → Authentication**: activar la protección de contraseñas filtradas (solo lo puede hacer el usuario).
- La política vieja `work_orders_update` permite que una cuenta con escritura modifique la tabla de órdenes directamente. Hay que cerrarla en un SQL nuevo, cuidando que `vocatus_save_work_report` siga pudiendo cerrar órdenes.
- Probar de punta a punta, con dos cuentas reales, «Aceptar orden» y los avisos de reportes.
- `solicitud.html` / `solicitud.js` quedaron sin uso, porque Bodega está oculta. Se pueden borrar más adelante si se confirma que no se usan en la versión de computadora.

# Auditoría de interfaz y correcciones · 30 de octubre de 2026

Se revisó la app actual con navegador Chromium automatizado y capturas, reproduciendo la superposición de Reportar con el 3D aportada por el usuario. El acceso con contraseña y la distinción administrador/usuario quedan fuera de esta entrega por petición expresa.

## Problemas corregidos

| Problema reproducido | Causa | Corrección |
| --- | --- | --- |
| Resumen de la bomba sobre el título y formulario de Reportar al localizar en el 3D | Un panel de 440 px mantenía una cuadrícula de formulario y resumen de 300 px; al formulario le quedaban 43 px de pista y sus elementos desbordaban | Una columna cuando se muestra el mapa; resumen lateral solo desde 1200 px y con el contenido a todo el ancho. Panel de trabajo con ancho de 380–620 px junto al 3D |
| Campos y botones de guardado mal ajustados en el panel estrecho | Tamaño mínimo de contenido y fila de acción sin espacio suficiente | Paneles con min-width:0, botones que admiten varias líneas y acción principal en una columna en el panel estrecho |
| Pendientes con lista y ficha dentro de un panel lateral demasiado estrecho | La ficha no recuperaba el ancho disponible al cambiar de estado | Lista y detalle usan el espacio desde la navegación lateral hasta el borde derecho, con columnas flexibles |
| Muy poca altura de trabajo en teléfono horizontal | Encabezado y altura mínima del mapa consumían casi toda la pantalla | Encabezado compacto y mapa limitado por la altura real de la ventana en pantallas bajas |
| No había salida directa del mapa en el formulario | La vista 3D se abría sin una acción para cerrarla dentro del flujo | Botón para ocultar el 3D y continuar, conservando equipo y borrador |
| Error de formulario fuera de la vista | Aviso al final del formulario sin desplazamiento ni foco al fallar | El error se anuncia como alert, se desplaza a la vista y recibe foco |
| Pantalla completa cambiaba el texto pero no ampliaba la ficha | Las reglas de la app imponían position:static también al inspector ampliado | Ficha ampliada dentro del área de trabajo, salida con Escape, nombre accesible y cierre al navegar a otra sección |
| Una sección inválida en la URL podía interrumpir el inicio | Se usaba el parámetro s sin comprobarlo | Sección válida de reserva: Áreas |
| Avisos temporales podían interceptar clics | El toast flotaba sobre otras acciones | Aviso sin captura de eventos de puntero y con ancho limitado |

## Referencias de interfaz

- [MaintainX: navegación móvil y módulos](https://help.getmaintainx.com/getting-started-new-users/mobile-app-overview). Referencia para navegación inferior, tareas y equipos.
- [UpKeep: órdenes de trabajo en escritorio](https://help.onupkeep.com/en/articles/9602737-how-to-view-and-process-work-orders-on-web). Referencia para navegación lateral, detalles y evidencias.

Se aplican esos patrones a la app existente. Se conserva la identidad Vocatus; no se incorporan plantillas propietarias ni una biblioteca adicional de interfaz.

## Verificación

`npm run test:ui` ejecuta `visor-bombas/tools/e2e-app.mjs`. Requiere Playwright y Chromium; admite PLAYWRIGHT_MODULE, BROWSER_EXECUTABLE y UI_SCREENSHOTS_DIR, igual que las herramientas anteriores del repositorio. Si Playwright no está instalado o disponible en esas rutas, el comando falla; no forma parte de la suite básica de Node.

- 61 comprobaciones de navegador aprobadas; sin errores JavaScript ni solicitudes de escritura a las rutas de mantenimiento, equipos o levantamientos durante la prueba.
- Reportar con 3D en doce anchos: 320, 360, 390, 420, 768, 900, 901, 1024, 1280, 1440, 1560 y 1920 px; también en horizontal 844 × 390.
- Navegación por Áreas, Pendientes, Historial, Bodega y Reportar en siete tamaños de ventana. Comprobaciones de desbordamiento, superposición y altura útil; capturas para inspección visual.
- Validación visible, cambio de equipo con recuperación del borrador, guardado de un reporte sintético solo en el navegador, filtros de Historial, tema claro, Pendientes con ficha, ampliación y Escape.
- Ajuste sin desbordamiento de levantamiento, avance, solicitud y equipo a 1280 y 390 px. No se guardaron ediciones en esas páginas.
- Consulta de Historial con WebGL deshabilitado y entrada mediante el botón de bienvenida.
- `npm test`: 234 pruebas aprobadas, ejecutado con OBSIDIAN_VAULT apuntando a una bóveda temporal de prueba.
- `npm run guard:historial`: aprobado.

Las capturas y el resultado JSON quedan en `informes-auditoria/interfaz-app/`, excluido de Git. El servidor de navegador se inicia con VERCEL=1 y VOCATUS_DEMO=1, sin claves de IA ni bóveda real; se bloquean Supabase y las rutas locales de escritura. El navegador y sus datos sintéticos se descartan al terminar.

## Límites y trabajo posterior

Son pruebas automatizadas en Chromium con tamaños simulados, no una comprobación en teléfonos físicos, Safari o Firefox. No se verificaron cámara física, lectores de pantalla ni sincronización de datos reales. No se modificaron permisos, acceso a la base ni el modelo de mantenimiento. La interfaz de inicio de sesión y los roles se abordarán después de esta corrección.

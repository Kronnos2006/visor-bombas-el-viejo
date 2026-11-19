# Revisión previa al lanzamiento de Vocatus

El visor requiere una cuenta aprobada. Producción redirige HTTP a HTTPS con 308 y aplica `X-Robots-Tag: noindex, nofollow`. La pantalla de acceso y el logo son públicos. El sitemap queda fuera del despliegue mientras no haya páginas destinadas a indexarse.

| Punto | Resultado y evidencia |
| --- | --- |
| 404 | Página propia con enlace al inicio. Una sesión local de prueba recibió 404 con HTML. Las rutas de API conservan sus errores JSON. Falta comprobar la respuesta en Vercel. |
| Diseño | 54 comprobaciones de interfaz DEMO en Edge. Se corrigió el desborde de Pendientes a 320 px. Falta verificar en teléfonos físicos y con zoom. |
| Enlaces | Las referencias estáticas internas de las 13 páginas iniciales apuntan a archivos existentes. El recorrido DEMO incluye varias rutas y una sección inválida. Falta revisar enlaces generados y externos con cuenta aprobada. |
| Formularios | DEMO verifica el foco al presentar un error, la recuperación de borradores por equipo y el guardado local. Quedan levantamientos, solicitudes, fotos y pérdida de red en un entorno autorizado. |
| Carga | El gráfico del historial se carga al entrar en ese flujo y anuncia el estado. El modelo 3D ya muestra progreso. |
| Errores | Se corrigió una excepción que interrumpía la actividad del historial. La prueba de interfaz termina sin errores de JavaScript. Falta revisar consola y red autenticadas. |
| SEO | Producción aplica noindex. Se conserva la política de acceso del visor. |
| Metadescripción | Añadida a la pantalla de acceso. |
| Títulos | Las páginas revisadas tienen títulos propios, incluida la nueva 404. |
| Sitemap | Sin sitemap mientras el visor siga siendo privado. |
| Robots | Archivo público y prueba HTTP local sin sesión. El contenido se verificó en la vista previa de Vercel. Falta comprobar el estado HTTP en producción. |
| Texto alternativo | Presente en logos y galerías principales. Falta revisar imágenes dinámicas en todos los flujos. |
| Open Graph | Añadidos título, descripción e imagen de marca en la pantalla de acceso. Falta comprobar la vista previa de un enlace publicado. |
| Favicon | Añadidos el ICO y las referencias faltantes. El ICO responde 200 en la prueba local sin sesión. |
| HTTPS | Confirmado en producción antes del cambio. Falta repetir después de publicar. |
| Analytics | No se encontró integración en el código y la ruta de Vercel Analytics respondió 401 anónimamente. El panel de Vercel mostró Web Analytics desactivado. |
| Imágenes | Las galerías existentes usan carga diferida. Falta revisar peso y formato en móvil con fotos autorizadas. |
| Accesibilidad | La prueba DEMO cubre foco y anuncio del error y cierre con Escape. Quedan contraste, navegación completa por teclado, zoom y lector de pantalla. |
| Consola | La prueba DEMO terminó sin excepciones de JavaScript. Queda la revisión con sesión y red real. |
| Rendimiento | Se difirió el módulo de gráficos del historial, de 606 525 bytes de archivo, fuera de la carga inicial. La comparación antes/después se realiza en Edge local con datos DEMO. |

La rama de preparación conserva los cambios fuera de producción. Para cerrar el despliegue, hace falta comprobar la vista previa con permisos válidos y confirmar en producción HTTPS, acceso, 404, favicon y los flujos principales. La lectura de fotos compartidas debe comprobarse desde una segunda cuenta autorizada.

## Medición local de carga del 3D

Edge sin interfaz, datos DEMO, caché inicial vacía y modelo comprimido del proceso de compilación. Una carga por versión y tamaño. El tiempo se tomó al detectar el modelo integrado listo. La cobertura estima los bytes de JavaScript ejecutado.

| Ancho | Tiempo antes → después | Bytes transferidos antes → después | Bytes de JS ejecutado antes → después |
| --- | ---: | ---: | ---: |
| 390 px | 25,62 s → 20,45 s | 30 661 555 → 30 056 590 | 1 199 869 → 1 120 568 |
| 1440 px | 26,29 s → 27,51 s | 30 661 555 → 30 056 590 | 1 198 488 → 1 119 183 |

El gráfico del historial dejó de descargarse en la carga inicial en ambos tamaños. Una sola corrida por tamaño no permite atribuir las diferencias de tiempo al cambio. La última ejecución de `npm test` registró 367 pruebas correctas y la prueba DEMO de interfaz registró 54 comprobaciones sin excepciones de JavaScript.

## Acceso a la vista previa y Analytics

El panel de Vercel confirmó que el despliegue de `d04d239` estaba listo y que Web Analytics estaba desactivado. La URL de vista previa sirvió el contenido esperado de `robots.txt`. La portada indicó que el despliegue no tiene acceso configurado, por lo que quedan pendientes las pruebas autenticadas en un entorno configurado.

## Prueba autenticada local

Edge a 390 y 1440 px con una cuenta local sintética y almacenamiento de autenticación temporal. Un enlace directo a Levantamiento redirigió al acceso y, al entrar con teclado, volvió a la misma ficha. El borrador persistió durante una desconexión y reapareció tras reconectar y recargar. Con la sesión iniciada, una ruta inexistente respondió 404 y Tab enfocó «Volver al inicio». El navegador no registró excepciones de JavaScript en ese recorrido. En ambos anchos también se eligió una imagen PNG de prueba desde Levantamiento. El aviso confirmó el guardado, la vista mostró texto alternativo y la foto se recuperó como JPEG tras recargar. La lectura compartida de fotos sigue pendiente de dos cuentas en un entorno que permita probarla.

## Contraste del acceso

Se oscureció el ámbar del tema claro. El texto blanco sobre el botón principal pasó de 3,68:1 a 5,28:1 y conserva 4,64:1 al pasar el puntero. Se verificaron el título y la descripción Open Graph y que la imagen local de marca tiene 200 × 200 px. Falta validar cómo lo muestran las plataformas al compartir la URL publicada.

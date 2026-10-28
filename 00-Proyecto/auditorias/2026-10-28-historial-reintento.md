# Recuperación del historial — 28 de octubre de 2026

La captura del usuario mostró dos avisos idénticos de almacenamiento y una instrucción de reintentar sin botón disponible. El gráfico y la lista consultaban por separado y cada uno imprimía el mismo fallo.

Ahora la apertura del historial comparte la consulta entre gráfico y lista. Los errores aparecen en un único aviso, con el botón «Reintentar cargar historial». Reintentar actualiza ambos apartados sin recrear el formulario ni borrar su texto. Al desbloquearse la conexión local se emite un aviso interno y el historial pendiente se recupera automáticamente. Los errores tardíos de otra bomba no afectan la ficha actual. El mensaje de bloqueo incluye historial y fotos y nunca recomienda borrar los datos del sitio.

## Evidencia

- 141 pruebas de Node aprobadas. La regresión nueva verifica una sola solicitud de apertura, error recuperable, evento de disponibilidad y conservación de un informe previo.
- Navegador aislado con dos páginas: una mantiene abierta IndexedDB versión 1 y la otra abre Historial de B4. Un solo aviso y botón visible; reintentar con el bloqueo activo no duplica mensajes.
- Al cerrar la conexión antigua, el historial recupera automáticamente el informe sembrado para la prueba y conserva el título que se estaba escribiendo.
- Ficha comprobada también a 390 × 844; sin errores de JavaScript.
- Servidor local con bóveda temporal, modo público simulado y escrituras API bloqueadas. No se cambiaron fichas reales ni se borró almacenamiento del usuario. Capturas y datos ficticios de prueba permanecen locales.

El bloqueo por otra pestaña se reprodujo; la captura por sí sola no permite afirmar que esa fuera la causa exacta del retraso del navegador del usuario. El botón también permite reintentar retrasos transitorios.

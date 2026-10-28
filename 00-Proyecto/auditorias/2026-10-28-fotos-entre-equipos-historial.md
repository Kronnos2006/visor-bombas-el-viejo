# Fotos entre equipos y ficha de Historial — 28 de octubre de 2026

## Diagnóstico comprobado

El video aportado (176,5 segundos) se examinó localmente. En Vercel, las fotos de «Actualizar fotos» se guardan en IndexedDB `vocatus-fotos`, por origen y navegador. No hay un servicio de sincronización de esas fotos entre teléfono y PC. La exportación de levantamiento incluía adjuntos generales, pero omitía las fotos de las casillas de bomba, placa, sello y componentes. Esto explica que no aparezcan en otro equipo; no demuestra que las fotos del teléfono hayan sido borradas.

Había además lecturas locales que convertían los errores de almacenamiento en fotos ausentes y consultas que revocaban URLs de imágenes todavía visibles. La nueva lectura distingue fallo de ausencia y reutiliza URLs por versión. Si falla el almacenamiento local, las fotos de Obsidian siguen disponibles con una advertencia.

## Cambios

- Descarga por TAG y respaldo de todas las fotos locales, con TAG, categoría, fecha y bytes. Se conserva compatibilidad con las fotos ya guardadas en `vocatus-fotos` versión 1.
- Carga de paquetes en ficha y editor. Validación completa del formato, límites, duplicados, categorías, TAG y decodificación de las imágenes antes de escribir; importación local en una sola transacción.
- Las casillas locales ocupadas se conservan y se informa cuántas se omitieron. El archivo original permite comparar las fotos no incorporadas; no se clasifica ni verifica un equipo por importar fotos.
- En el visor conectado se pueden enviar las fotos locales a Obsidian. Las casillas del servidor ya ocupadas se conservan para revisión; las copias del navegador no se borran. Una nueva versión local guardada durante un envío no se sustituye al completar ese envío.
- Los paquetes de levantamiento ahora incluyen `expedientePhotos` del TAG correspondiente. Se comprueba ese TAG antes de enviar datos. Se sincronizan solo las fotos efectivamente incorporadas desde el archivo, evitando enviar otra foto local que hubiera colisionado.
- El respaldo por TAG filtra antes de aplicar los límites: otras bombas no bloquean su descarga. La exportación mantiene la misma prioridad de fotos pendientes/servidor que la vista.
- Las sustituciones hechas solo en el navegador archivan la versión anterior dentro de su almacén local.

## Historial

La apertura desde el modelo y desde la lista se conserva. Ahora se da prioridad a ficha, historial escrito en la nota, reportes de campo y fotos. En PC el panel documental ocupa más ancho; en teléfono la ficha usa el espacio principal. «Ficha», «Registros» y «Fotos» tienen accesos visibles. El despiece se abre únicamente con «Ver despiece 3D». Las métricas son optativas y no se generan lecturas DEMO para estos equipos. El botón flotante deja de tapar los datos; Reportar permanece en la navegación principal.

## Diseño y revisión

Refero remoto respondió `NO_SUBSCRIPTION`; no se contrataron servicios. Se usaron la interfaz existente, el video y las guías locales de formas/tacto/estados como referencias de implementación directa. Se conservan fondo, ámbar, logo animado, fuentes y controles existentes.

| Decisión | Referencia y motivo |
|---|---|
| Ficha ancha y accesos visibles | Video y petición del usuario: leer los registros en lugar del despiece impuesto |
| Botones grandes y estado de guardado explícito | Guía local Refero `craft-details`: tacto, foco y recuperación comprensible |
| Separar copia local de Obsidian | Código de persistencia y prueba de dos navegadores; evitar prometer sincronización inexistente |

Herramientas e Innovación/Recursos de IA realizó una revisión independiente de lectura. Sus cinco hallazgos de pérdida/colisión fueron corregidos: fallback de Obsidian, alcance por TAG, claves añadidas por importación, revisión de versiones durante envío y prioridad de exportación. También se incorporó el historial documental que señaló. No es una revisión ni aceptación de la adaptación Praj o del modelo Revit.

## Verificación

146 pruebas aprobadas, incluidas cinco nuevas del formato portátil. Navegador aislado en teléfono y PC: guardado y recarga, paquete de levantamiento con fotos categorizadas, transferencia de bytes exactos, importación repetida/malformada/corrupta, envío a una bóveda temporal y conservación de casillas ocupadas. Se simularon una actualización durante el POST y un fallo de IndexedDB con fotos válidas de Obsidian. Historial y botón optativo de despiece verificados; sin errores de JavaScript.

El video, las capturas, los paquetes y las fichas temporales no se publican en Git. No se modificaron fichas reales ni Revit. La recuperación de fotos del usuario requiere abrir el mismo teléfono, navegador y dirección donde se guardaron y descargar allí el paquete; no se afirma haber inspeccionado o recuperado esas fotos privadas. La sincronización automática por Internet sigue requiriendo almacenamiento compartido y acceso autenticado, que este cambio no inventa ni habilita.

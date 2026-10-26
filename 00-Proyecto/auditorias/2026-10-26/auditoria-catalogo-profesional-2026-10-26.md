# Auditoría del catálogo de bombas frente a herramientas profesionales

Fecha: 26 de octubre de 2026. Revisión del checkout local con último commit observado `45b1241`.

## Alcance y conclusión

Se revisaron documentación, servidor, levantamiento, persistencia, simulador, expediente, declaraciones de licencia de dependencias directas instaladas y archivos de bibliotecas distribuidas con el visor. No se modificó el proyecto ni se publicaron cambios. Dos defectos se reprodujeron usando una copia de B32 dentro de la carpeta de trabajo de esta conversación; no se escribieron fichas reales.

Esta revisión es de código y documentación, con pruebas dirigidas. No vuelve a certificar las 80 pruebas anteriores, no incluye un análisis exhaustivo de vulnerabilidades o de todas las dependencias transitivas, ni una inspección física de planta. Las notas del README sobre cantidad de fichas y placas son documentación declarada, no un recuento nuevo de campo.

El producto funciona como atlas de equipos y apoyo al mantenimiento. Para compararlo con un catálogo profesional de fabricante hay que valorar datos verificables, curvas oficiales, referencias de repuestos y revisión documental, además de la interfaz. Para compararlo con un sistema multiusuario de mantenimiento se añaden permisos, trazabilidad y recuperación. Son objetivos distintos: una tienda o un selector hidráulico no son requisitos obligatorios de un atlas interno.

## Comparación y notas orientativas

Las notas expresan madurez observada respecto de cada objetivo; no son una certificación ni porcentajes de cumplimiento. No se promedian porque cada dimensión tiene un alcance diferente.

| Dimensión | Nota /10 | Evidencia y brecha |
|---|---:|---|
| Interfaz de consulta | 8 | Tema compartido, búsqueda normalizada, ficha móvil y accesos rápidos documentados y comprobados en la entrega anterior. Falta validar dispositivos físicos, tareas de usuarios y accesibilidad completa. |
| Identificación del equipo | 5 | B32 conserva identificación ambigua y serie vacía; siete TAG de torre siguen pendientes de asociación física. |
| Documentación por variante | 5 | El expediente distingue referencias exactas y de familia. Faltan expedientes completos por serie, revisión y variante de equipo. |
| Repuestos listos para compra | 4 | B32 tiene sello sin código y o-rings vacíos; los rodamientos tienen pertenencia por confirmar. La solicitud PDF no valida por sí sola compatibilidad ni existencias. |
| Selección hidráulica profesional | 3 | Curvas sintéticas, parámetros supuestos y simplificación del fluido. Adecuado para explicación; no sustituye curvas de fabricante. |
| Control de verificación | 3 | Una observación sola activa autor y fecha de verificación. Falta separar registro de información de aprobación de identidad y datos. |
| Acceso multiusuario | 3 | Contraseña compartida opcional en Vercel, sin roles individuales observados en las rutas revisadas. Adecuación local y adecuación publicada son distintas. |
| Preparación documental de licencias | 3 | README sin licencia propia; algunos avisos presentes, sin expediente consolidado de derechos y componentes. No implica que todas las dependencias sean incompatibles. |

Referencia profesional: [KSB EasySelect](https://www.ksb.com/en-nl/tools/planning-tools/ksb-easyselect) ofrece selección por criterios, fichas, curvas, CAD y configuraciones. [Grundfos](https://www.grundfos.com/solutions/support/select-configure-tendering) presenta herramientas de selección, dimensionamiento y documentación. Se comparan sus funciones publicadas; no se probó cada producto con una cuenta de cliente.

## Hallazgos prioritarios comprobados

### 1. Registrar una observación verifica toda la ficha — prioridad alta

`visor-bombas/survey.mjs:144–145` escribe `verificado_por` y `fecha_verificacion` al guardar cualquier levantamiento válido, incluso si solo hay una observación. `public/interfaz-core.js:5–9` considera esos dos campos suficientes para mostrar verificación.

Prueba aislada: copia de B32, fecha válida, responsable y texto «Solo observación; identidad no confirmada». Resultado: `verified: true`.

Corrección: guardar autor/fecha de captura por separado; añadir una acción explícita de verificación con alcance —identidad, placa, repuesto— y evidencia. Una observación o una corrección parcial no deben aprobar la ficha entera. Revisar los registros ya marcados con esta lógica antes de considerarlos verificados.

### 2. El guardado acepta valores inválidos — prioridad alta

`survey.mjs:101` usa formato y `Date.parse`, que normaliza algunas fechas imposibles. El tratamiento de números en `survey.mjs:47` serializa valores sin comprobar sus rangos.

Prueba aislada: fecha `2026-02-31` y campo RPM `-500`. El guardado aceptó ambos. La interfaz puede rechazar posteriormente la fecha para el indicador, pero la ficha ya contiene el dato inválido.

Corrección: validar fecha por conversión de ida y vuelta; rechazar números negativos o texto en magnitudes que no lo admiten; aplicar unidad, rango y obligatoriedad según el campo. Aceptar coma decimal mediante una conversión explícita, si la planta la utiliza.

### 3. Los respaldos no cubren de igual forma todos los cambios — prioridad media, alta si se edita simultáneamente

`equipment.mjs` tiene respaldo de ficha y restauración para operaciones de equipo. El guardado de levantamiento revisado (`survey.mjs:98–155`) termina en archivo temporal y renombrado, sin el mismo respaldo previo ni comprobación de revisión leída.

El renombrado ayuda a evitar un archivo escrito parcialmente, pero no evita que un levantamiento sobreescriba una edición concurrente de Obsidian. No se reprodujo una pérdida real.

Corrección: extender el respaldo al levantamiento. Añadir comprobación de versión o hash si se confirma uso simultáneo; no construir un sistema complejo de conflictos sin esa necesidad.

### 4. Publicación y red local requieren una política de acceso — prioridad condicionada al despliegue

`server.mjs:151` limita la contraseña a Vercel; `password.mjs` permite acceso cuando no está configurada. `server.mjs:299` escucha en todas las interfaces si existe `PORT` o se usa desarrollo en nube. Las comprobaciones de Host, Origin y token presentes ayudan, pero no equivalen a identidad ni permisos por usuario.

Corrección: conservar escucha local por defecto; antes de compartir datos reales por red definir autenticación, permisos de consulta/edición/aprobación y registro de acciones vinculado a la sesión. No presentar un nombre escrito en un formulario como identidad autenticada. No se realizó una prueba de intrusión.

### 5. Curvas y dimensiones no autorizan selección ni compra — brecha funcional

`public/sim-view.js:48` declara curva sintética. La línea 65 describe eficiencia ilustrativa, etanol puro y ausencia de viscosidad. B32 conserva identificación ambigua, sello sin código y ausencia de o-rings. El README dice que el 3D no es plano de taller.

Corrección: incorporar curvas Q-H, eficiencia, potencia y NPSHr de la variante real, con RPM, impulsor, fluido, unidades, revisión y fuente. Para repuestos, asociar despiece y número de parte a serie y variante. Mantener la simulación didáctica separada y claramente identificada.

## Qué falta para un catálogo útil en planta

1. Confirmar identidad física con TAG, placa legible, serie, ubicación y responsable. Resolver B2, B3, B4, B7, B8, B9 y B10 sin inferir sus identidades.
2. Completar una ficha piloto con documentos oficiales de la variante, fuentes y fechas de revisión. B32 es un ejemplo útil porque evidencia campos pendientes.
3. Incorporar lista de materiales y repuestos: posición del despiece, número de parte original, dimensiones verificadas, material, cantidad, código de bodega y sustitución aprobada.
4. Consultar existencias y estado de solicitud si se decide integrar bodega. Un PDF firmado no es una reserva automática de inventario.
5. Añadir QR que abra el TAG directamente; probar la consulta y el registro en los teléfonos reales usados en planta.
6. Definir funcionamiento sin conexión según la infraestructura. Un servidor en la PC funciona sin internet, pero no ofrece por sí solo una copia offline en cada celular. Las fuentes web y manuales externos requieren conexión o copias autorizadas.
7. Probar recuperación de ficha y adjuntos desde un respaldo externo. Una copia en la misma unidad no cubre avería o pérdida de esa unidad.
8. Medir descarga, preparación 3D, memoria y respuesta en dispositivos representativos. El archivo principal Blender inspeccionado pesa 31.305.860 bytes; comprimir no garantiza fluidez.

## Licencias y permisos

No hace falta comprar una «licencia de catálogo profesional» solo por construir esta aplicación. Cada pieza tiene condiciones diferentes.

| Elemento | Lo observado | Acción necesaria |
|---|---|---|
| Código propio | README: «Sin licencia definida. Trabajo académico de práctica profesional». | Acordar titularidad y derechos con autor, empresa y, si corresponde, universidad. Documentar uso interno o licencia de distribución. No asignar MIT a documentos o modelos ajenos. |
| Three.js y js-yaml | Hay textos de licencia incluidos. | Preservar avisos y verificar que acompañen la entrega. |
| React, React DOM, Recharts, pdf-lib y esbuild | Los paquetes directos instalados declaran MIT. | No se observó necesidad de pagar regalías por esos componentes bajo MIT. Incluir textos y avisos exigidos; inventariar también dependencias transitivas. Esbuild es herramienta de construcción. |
| Meshoptimizer | Cabecera MIT con autor. | Preservar autor y completar texto de licencia aplicable en la distribución. |
| Draco | Decodificadores JS/WASM distribuidos; no se observó LICENSE/NOTICE en su carpeta. | Identificar versión y distribución exactas; acompañar Apache 2.0 y los avisos aplicables. Revisar NOTICE si lo trae la distribución de origen. |
| Anatomy | Archivo MIT con atribución a Ryan; código declara inspiración. | Mantener el aviso y registrar URL, versión o commit de procedencia para hacer verificable esa atribución. |
| Tipografías | El HTML pide Fraunces, JetBrains Mono y Plus Jakarta Sans a Google Fonts. | Registrar licencia de cada familia; si se alojan localmente, conservar sus avisos. No asumir funcionamiento visual completo sin conexión. |
| Blender | Su licencia permite usar las obras creadas, incluso comercialmente. | No exige comprar Blender ni abrir el código del visor por exportar GLB. Modelos, texturas y otros recursos de terceros conservan sus propias condiciones. |
| Revit / AutoCAD | Los scripts describen modelos exportados desde Revit/FBX. No se comprobó el tipo de licencia utilizado. | Para crear o editar en Autodesk, verificar licencia apropiada al uso profesional. Ver un GLB en este visor no requiere una licencia Revit por usuario. No concluir incumplimiento sin conocer la licencia real. |
| Manuales, fotografías, planos y modelos | Hay enlaces a fabricantes y recursos procedentes de Excel/modelos de planta. | Registrar dueño, origen, uso autorizado y permiso de redistribución cuando corresponda. Un PDF accesible públicamente no concede automáticamente permiso para republicarlo. |
| Normas técnicas | B32 identifica ANSI/ASME B73.1 como inferencia pendiente. | No presentar una inferencia como certificación. Consultar normas mediante acceso legítimo y comprobar permisos antes de reproducir texto o tablas. |
| Gemini | La ruta envía ficha, historial e informes al proveedor al realizar una consulta. No se comprobó facturación ni contrato. | Revisar condiciones del servicio y autorización empresarial antes de enviar información real. Diferenciar servicio gratuito de servicio con facturación y tratamiento de datos correspondiente. |

Fuentes oficiales consultadas:

- [Licencia MIT de Three.js](https://github.com/mrdoob/three.js/blob/dev/LICENSE).
- [Licencia Apache 2.0 de Draco](https://github.com/google/draco/blob/main/LICENSE).
- [Licencia de Recharts](https://github.com/recharts/recharts).
- [Blender: licencia y obras creadas](https://www.blender.org/about/license/?roistat_visit=2540962).
- [Autodesk: límites de fines educativos](https://www.autodesk.com/company/educational-purposes): excluye usos profesionales y gestión de instalaciones. Que el proyecto naciera de una práctica académica no resuelve automáticamente el alcance de uso posterior.
- [Google Fonts](https://developers.google.com/fonts): uso comercial y no comercial, sujeto a licencias de las familias.
- [ASME: publicaciones y permisos](https://www.asme.org/codes-standards/publications-information).
- [OMPI: preguntas sobre derechos de autor](https://www.wipo.int/en/web/copyright/faq-copyright): los permisos dependen del uso, titular y excepciones aplicables.
- [Términos de Gemini API](https://ai.google.dev/gemini-api/terms): el servicio gratuito puede usar entradas y salidas para mejorar productos, e indica no enviar información confidencial; los servicios con facturación tienen condiciones diferentes.

Esta revisión identifica documentación pendiente; no determina titularidad contractual ni acredita el estado de licencias instaladas de Autodesk.

## Orden recomendado de acción

1. Corregir verificación automática y validación de fechas/números; añadir pruebas dirigidas que impidan regresiones.
2. Respaldar también levantamientos; evaluar simultaneidad real antes de ampliar control de conflictos.
3. Confirmar los TAG pendientes y completar un expediente piloto con repuestos verificables.
4. Crear inventario de bibliotecas y recursos con origen, versión, titular, licencia, atribución y permiso de publicación. Resolver licencia del código propio.
5. Incorporar curvas y planos oficiales solo si el objetivo incluye selección hidráulica o compra por catálogo.
6. Preparar QR, teléfonos reales y acceso sin conexión según necesidad de planta.
7. Si se comparte por red, definir autenticación y permisos; si se publica, revisar derechos de los contenidos y condiciones del proveedor de IA antes de usar datos reales.

No hace falta rehacer la interfaz ni comprar otro motor 3D para completar los primeros cuatro pasos.

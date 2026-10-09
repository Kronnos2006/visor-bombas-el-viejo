---
actualizado: 2026-10-07
estado: documentacion
---

# Pendientes y migración

## Para cerrar la propuesta

- Activar Gemini con una clave y probar preguntas, fuentes, errores de cuota y ausencia de datos.
- Revisar visualmente la vista de planta, selección, iluminación, separación de piezas y el panel en el equipo de presentación.
- Validar con Dimas alcance, documentación disponible y aprobación del proyecto.

## Para adaptar a la planta

- Confirmar marca, modelo, TAG, placa, dimensiones, sellos, materiales, códigos y documentos de cada bomba.
- Obtener el CAD/despiece específico, si está disponible; no prometer descarga gratuita para cualquier fabricante/modelo.
- Sustituir la geometría genérica y las posiciones ilustrativas por datos verificados.
- Definir responsable de actualización, respaldos, acceso y administración si se amplía a varios usuarios.

## Auditoría del exportador vigente

Estado al revisar scripts/exportar_cmms.py:

1. La guarda excluye fichas con demostracion=true. El caso de cero activos se corrigió con COLS_ACTIVOS; no seguir describiéndolo como fallo vigente si la prueba aislada pasa.
2. Sigue leyendo informes-mantenimiento; el visor escribe Mantenimiento. También espera tag/responsable en YAML, mientras el visor usa bomba y responsable en el cuerpo. Falta un adaptador para que no se pierdan informes.
3. Los IDs de órdenes son secuenciales y pueden cambiar al incorporar historial anterior.
4. Un número de parte genera una raíz de código; las colisiones se resuelven durante el recorrido. Revisar estabilidad al agregar fabricantes con el mismo número de parte.
5. La guarda de ficha no sustituye la validación de cada informe externo ni la integridad orden→activo exportado.
6. El parser YAML propio es limitado y elimina comentarios con una expresión regular que puede alterar texto entre comillas. Contrastar con un parser YAML estándar antes de ampliar formatos.
7. Revisar la clasificación ISO declarada contra la norma aplicable. No usar estos campos como prueba de cumplimiento.
8. OBSIDIAN_VAULT configura el visor; el exportador actual define BASE desde su propia ubicación y no lee esa variable. Corregir las instrucciones que lo sugieren.

No se modificó el comportamiento del exportador durante esta organización documental. Los cuatro CSV son base de intercambio, no un formato universal. Cada CMMS requiere mapeo, validación y pruebas de importación. Tampoco se garantiza esfuerzo de horas ni compatibilidad automática.

## Datos a revisar

El generador de fichas incluye valores por defecto de estado=operando y criticidad=media. Son valores del generador, no evidencia de una inspección real; verificar antes de usarlos en decisiones. La confianza general de la ficha no equivale a validación de todos sus campos.


---
actualizado: 2026-10-07
estado: documentacion
---

# Arquitectura y datos

## Flujo

~~~mermaid
flowchart LR
  U[Usuario] --> W[Web local / Three.js]
  W --> S[Servidor Node.js]
  S --> D[demo-vault: datos ficticios]
  S --> R[Obsidian: fichas reales]
  S -->|Solo al consultar con clave| G[Gemini]
~~~

El proceso selecciona una única bóveda al iniciar. VOCATUS_DEMO=1 impone demo-vault; en otro caso usa OBSIDIAN_VAULT o la ruta real por defecto.

## Ubicaciones

| Contenido | Ruta relativa |
|---|---|
| Fichas reales | Bóveda real / 00-Proyecto/bombas |
| Informes reales del visor | Bóveda real / 00-Proyecto/Mantenimiento |
| Fichas demo | visor-bombas/demo-vault/00-Proyecto/bombas |
| Informes demo | visor-bombas/demo-vault/00-Proyecto/Mantenimiento |
| Código frontend | visor-bombas/public |
| Exportador separado | Bóveda real / 00-Proyecto/scripts/exportar_cmms.py |

## Endpoints

| Ruta | Método | Función |
|---|---|---|
| /api/bootstrap | GET | Lista de fichas, modo, nombre de bóveda y sesión local. |
| /api/pump?tag=... | GET | Ficha y sus informes. |
| /api/document | GET | Descarga de un archivo existente vinculado a esa ficha. |
| /api/config | POST | Configuración de Gemini en memoria. |
| /api/maintenance | POST | Crear una nota nueva de intervención. |
| /api/ask | POST | Consultar Gemini con el equipo seleccionado. |

POST requiere un token de sesión local y comprueba el origen. El servidor comprueba Host y limita rutas. No es autenticación multiusuario ni una auditoría de seguridad completa. No publicar directamente en internet.

## Estructura de datos

TAG identifica el equipo. YAML contiene placa, servicio, sellado, lista de o-rings, documentos, fuente y confianza. El cuerpo de la ficha contiene secciones de historial y fallas. Los informes del visor llevan tipo, bomba, fecha y demostracion en YAML; responsable e intervención van en el cuerpo.

Medidas vacías siguen vacías. El contexto Gemini usa campos estructurados e historial, evitando el párrafo de medidas ficticias de ejemplo de P-1401. Los datos demo llevan demostracion=true.

No existe todavía un enlace entre piezas de un CAD real e identificadores de repuesto. Los 10 componentes actuales son ilustrativos y sus campos están asociados manualmente.


---
actualizado: 2026-10-07
estado: documentacion
---

# Manual de uso

## Abrir y cambiar de modo

En la carpeta del visor:

| Archivo | Modo |
|---|---|
| Iniciar demostración.cmd | Dos bombas ficticias; usar para presentar. |
| Iniciar visor.cmd | Fichas reales. |
| Iniciar datos reales.cmd | Alias conservado del modo real. |

Cerrar el servidor anterior con Ctrl+C antes de cambiar. Abrir http://127.0.0.1:8766 y recargar con Ctrl+F5 si hay una pestaña antigua. Node.js es necesario; el lanzador busca el runtime disponible o node en PATH.

## Presentación

1. Comprobar «PROPUESTA · DEMO».
2. Seleccionar P-9001 o P-9002.
3. Girar con arrastre, acercar con la rueda y usar «Separar piezas» o el deslizador.
4. Seleccionar un componente o su botón para consultar la ficha.
5. Abrir Historial y registrar un informe de prueba. Se guarda en demo-vault, no en la planta real.
6. Usar Actualizar fichas después de editar los archivos.

## Gemini

En IA → Conectar Gemini, ingresar la clave en el diálogo local. No ponerla en notas ni en este repositorio. Se conserva en memoria hasta cerrar el servidor. Al consultar se envían a Google los campos y los informes del equipo seleccionado, no los planos. No hay respuestas simuladas cuando falta la clave. El modelo se puede configurar; su disponibilidad depende de la cuenta y cuota. Una suscripción de chat no configura la API.

## Problemas conocidos

- Puerto ocupado: cerrar la otra instancia antes de abrir el lanzador.
- Selección antigua P-1463 en demo: recargar; el código actualizado refresca la selección y responde con un mensaje legible.
- Plano «no encontrado»: la ruta registrada no coincide con un archivo local; corregirla en la ficha.
- Informe de prueba: siempre confirmar el modo visible antes de guardarlo.
- La impresión usa el navegador; no existe un generador de PDF técnico propio.


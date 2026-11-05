# Bombas, lugares y fotos

Estado al 5 de noviembre de 2026. Rama de prueba: `codex/cuentas-vercel`. `main` y producción no incluyen estos cambios.

## Qué se integró

- Bombas nuevas del FBX general en el 3D (`public/modelos/bombas-campo.glb`), sin tocar el modelo original.
- Torre DUSA ordenada según el FBX y el DWFX, con su vista por plantas.
- B4 a B8 fuera del 3D de la planta.
- Mejor visión: etiquetas, resaltado y contraste (`public/vision-bombas.js`).
- Ocultar o quitar bombas, solo para administradores (`public/bombas-admin.js`).
- Paleta desplegable de bombas en la vista por área (`public/paleta-bombas.js`).
- Bomba agregada entre B22 y B30 en el sector de tanques.
- Lista vigente de 83 bombas y ubicación indicada por el usuario.

## Dónde está cada dato

- `public/modelos/asignacion-bombas.json`: `A` son los lugares con su TAG, `Q` los lugares quitados, `N` los lugares nuevos y `excel` las 83 bombas.
- `public/asignacion-bombas.js`: lee esa lista.
- `public/app.js`, función `montarIntegrado`: aplica la lista al 3D.

## Regla de las fotos: van por lugar

Las imágenes pertenecen al lugar, no al número de la bomba. Si un lugar cambia de TAG, sus imágenes se quedan en ese lugar.

- **Fotos de campo:** están en `vocatus_photos`, con la clave del lugar en `entity_key`. Ninguna está guardada por TAG. `entidadDeFotos` traduce el TAG al lugar.
- **Fotos antiguas del Excel:** están en `public/expediente/` y usan el número viejo de cada lugar. `montarIntegrado` las pasa al TAG que quedó en ese lugar.
- **Bomba sin lugar en el 3D:** no muestra fotos antiguas.
- Las fotos de lugares quitados siguen en la base, pero no se ven en el visor.

Las fotos de una bomba nueva o con TAG cambiado no se renombran ni se mueven en la base.

## Pendiente

- Ejecutar `supabase/review/preparar-bombas.sql` en Supabase: falta la tabla `vocatus_pump_visibility`. Sin ella, ocultar o quitar bombas no se comparte entre usuarios.
- El usuario ordena las posiciones a mano. No reordenarlas sin que lo pida.
- Sin lugar en el 3D: B10, B15, B16, B22, B73, B75 a B80.
- Sector distinto al área del Excel: B1, B2, B61, B62, B67, B68, B81, B82, B83.
- B17, B18 y B20: la placa antigua dice Titan y el Excel dice Durco. Confirmar en campo.
- B41: la ficha dice Goulds 15SH06K6. Confirmar con la foto de campo de su placa.
- La página de levantamiento no conoce los cambios de TAG.
- Publicar en `main`: solo con permiso. Los pasos de cuentas están en `INTEGRACION-2026-10-30.md` y en el documento del proyecto.

## Comprobación

`npm test` pasa con 301 pruebas. Las fichas de B24, B34, B38 y B41 se abrieron en el Preview con las fotos de su lugar.

## Bombas horizontales de calderas

B72 y B74 se dibujan según las fotos de campo en `public/bombas-calderas.js`. El campo `modelo` de cada lugar nuevo en `asignacion-bombas.json` elige el dibujo. Las medidas son aproximadas.

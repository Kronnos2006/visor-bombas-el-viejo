# 15 — Referencia: Cortona3D RapidCatalog

> [!info] Revisión documental 2026-10-07
> Referencia histórica de diseño, no verificación comercial vigente. El visor tiene 10 componentes genéricos, sin importación CAD ni carrito. No se han comprobado aquí precios, cobertura del 80 %, equivalencia funcional ni disponibilidad gratuita de CAD. Ver [[Documentacion-visor/01-Estado-y-alcance]].

https://www.cortona3d.com/rapidcatalog

El producto comercial que hace exactamente lo que este proyecto quiere.
Sirve como referencia de diseño y como argumento en la reunión: lo que
proponemos no es una ocurrencia, es una categoría de software con veinte
años en la industria.

## Cómo se llama lo que estamos haciendo

- **IPC** — Illustrated Parts Catalog · catálogo ilustrado de repuestos
- **DPL** — Detailed Parts List · la tabla de piezas del despiece
- **Callout** — el globo numerado sobre el dibujo
- **Hotspot** — la zona del dibujo que responde al clic

Conviene usar este vocabulario en el informe de práctica. Es el que entiende
cualquier ingeniero de mantenimiento con experiencia.

## Comparación función por función

| Función de RapidCatalog | Lo nuestro | Estado |
|---|---|---|
| Vista 3D: rotar, zoom, ver desde varios ángulos | Visor Three.js | ✅ hecho |
| Vista de despiece 3D | Slider de despiece, 10–12 piezas | ✅ hecho |
| Callouts numerados sobre el modelo | Globos 01–12 clicables | ✅ hecho |
| Hotspots: clic en pieza → ficha | Raycasting sobre cada pieza | ✅ hecho |
| Tabla DPL enlazada al dibujo | Tabla de elementos sellantes | ✅ hecho |
| Importar nomenclatura y vincularla al 3D | `bombas.csv` → ficha → visor | ✅ hecho |
| Publicar como HTML | Visor local + artefacto web | ✅ hecho |
| **Generar DPL, callouts y hotspots automáticamente desde el CAD** | Manual | ❌ **falta geometría real** |
| Publicar como PDF | — | ❌ no hecho |
| Plantillas S1000D / ATA2200 / DITA | — | ❌ no aplica a esta planta |
| Carrito: enviar las piezas marcadas a un sistema de pedidos | — | ⬜ **vale la pena hacerlo** |

## La única diferencia de fondo

RapidCatalog **genera el despiece a partir del CAD del equipo**: lee el
archivo del fabricante, separa las piezas, pone los globos y arma la tabla
sola. Nosotros dibujamos un despiece genérico a mano.

Esa diferencia no se cierra con más programación. Se cierra **consiguiendo
el CAD de cada bomba**, que el fabricante publica gratis una vez que se sabe
marca y modelo. Con el CAD, nuestro visor muestra la bomba real; sin él,
ningún software del mundo puede.

## La función que sí deberíamos copiar

El **carrito de repuestos**: el mecánico recorre el despiece, marca el sello
y los dos o-rings que va a cambiar, y el sistema genera una solicitud a
bodega con los códigos correctos.

Es la función que convierte el visor de "bonito" en "ahorra tiempo". Y es
barata de hacer: ya tenemos los códigos deterministas en `repuestos.csv`.

## Qué decir en la reunión

> "Lo que propongo es lo que la industria llama catálogo electrónico de
> repuestos. Empresas grandes lo compran a Cortona3D o lo tienen dentro de
> SAP. Cuesta decenas de miles de dólares y necesita el CAD del fabricante.
> Yo puedo dejarles la versión que resuelve el 80 % del uso diario, con las
> 15 bombas y sin licencias — y si algún día compran uno, los datos que
> levantemos son exactamente lo que ese software pide para arrancar."

## Pregunta derivada, de alto valor

Los fabricantes suelen entregar catálogo electrónico de repuestos junto con
el equipo. **¿Praj entregó uno con el proyecto D-18033?** Si existe, buena
parte del levantamiento ya está hecho. Agregar a
[[11-Hoja-de-reunion-Dimas]].

Relacionado: [[13-Base-de-conocimiento-IA]] · [[14-Migracion-a-CMMS]]

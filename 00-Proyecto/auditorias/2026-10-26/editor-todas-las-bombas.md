# Actualizar imágenes, componentes y datos de todas las bombas

Implementado en la copia separada de revisión. El proyecto y las fichas originales permanecen intactos.

## Accesos

- Desde la ficha: **Actualizar datos**, con accesos a datos generales, placa, motor, sello, empaque, rodamientos/acople, o-rings y fotos.
- Desde el editor: el selector de TAG incluye **77 fichas B y 15 fichas P**, incluso las 49 fichas B que todavía no aparecen en el mapa. Esto no les asigna coordenadas ni una geometría por suposición.
- También se permite editar equipos inactivos.

## Qué se puede cambiar

| Apartado | Datos editables |
|---|---|
| Bomba | Nombre/ubicación registrada, servicio/fluido, marca, modelo, serie, tamaño, caudal, altura, impulsor y RPM |
| Motor | Marca, modelo, código de catálogo, serie, potencia en HP o kW y RPM |
| Sello | Marca, tipo/modelo, diámetro, materiales de caras, elastómero y código |
| Empaque | Tipo, sección y cantidad de anillos |
| Rodamientos y acople | Códigos delantero/trasero, pertenencia a bomba/motor y código/modelo de acople |
| O-rings | Agregar, editar material/medida/cantidad/código o quitar filas existentes |

Los campos vacíos conservan el dato anterior. Para editar o eliminar o-rings hay una opción explícita de **Editar la lista existente**; el servidor rechaza reemplazarla si cambió desde que se abrió el formulario. Se conserva la información de procedencia de los registros existentes.

La potencia se registra en una sola unidad. Si se cambia de HP a kW o viceversa, se retira el valor anterior para que no siga prevaleciendo por error. El diámetro del sello respeta la unidad de la ficha: pulgadas en B y milímetros en P. El caudal indica GPM en B y m³/h en P.

## Fotos por equipo

Todas las fichas admiten diez categorías:

1. Placa de la bomba.
2. Placa del motor.
3. Bomba.
4. Posición.
5. Motor.
6. Sello mecánico.
7. Empaque.
8. O-rings.
9. Rodamientos.
10. Acople.

Cada foto corresponde a un TAG y una categoría. Al actualizarla se conserva la anterior en el historial. Las fotos se guardan al elegirlas; los datos del formulario se guardan con el botón final. En alojamientos sin escritura, el aviso identifica que las fotos permanecen solo en ese navegador.

Al reemplazar una bomba, las fotos de sus componentes también pasan al historial. Se conserva la foto de la posición para no atribuir fotos del equipo retirado a la bomba nueva.

## Referencias sin TAG

Las referencias geométricas sin identidad confirmada permiten completar datos de la máquina, motor, sello y otros componentes, además de las mismas categorías de fotos. Se identifican como **borradores guardados solo en el navegador**. Escribir un TAG en ese borrador no crea ni vincula automáticamente una ficha real.

## Comprobación

- **99 pruebas pasando**, incluidas siete nuevas sobre edición universal, unidades, corrección/eliminación de o-rings, lista desactualizada, fotos por TAG, acceso protegido y archivo de componentes al reemplazar equipos.
- Navegador: carga y sustitución real de imágenes de prueba, edición de sello/motor, corrección y eliminación de o-rings, bomba inactiva B22, ficha B50 fuera del mapa, ficha P-1401 y referencia sin TAG.
- Vista móvil emulada a 390×844 sin desbordamiento horizontal en el editor revisado.
- Sin errores JavaScript en la comprobación realizada.
- Las capturas con valores «PRUEBA» proceden de una bóveda aislada de validación, no de la planta ni de la copia usada para la revisión del usuario.

Se conservan las correcciones anteriores de verificación por alcance, fechas, respaldos y pedidos. Editar un dato no lo declara verificado automáticamente.

## Para verlo

Con el servidor local iniciado:

- Editor de una bomba: `http://127.0.0.1:50420/levantamiento.html?tag=B32`
- Fotos y componentes: `http://127.0.0.1:50420/levantamiento.html?tag=B32#editar-fotos`
- Desde el visor: seleccionar bomba y usar **Actualizar datos** o los accesos **Actualizar Bxx** de su ficha.

Estos cambios siguen en `work/visor-bombas-corregido`. No se publicaron ni se aplicaron al proyecto original. `editor-todas-las-bombas.zip` contiene los cambios acumulados de código, pruebas y documentación, sin fichas, fotos, modelos ni dependencias.

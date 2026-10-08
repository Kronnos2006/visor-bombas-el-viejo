# Visor/tools/documentar.mjs

Archivo del visor: tools/documentar.mjs

**Categoría:** Herramientas. **Captura:** 2026-10-07.

Original: [abrir archivo](<C:/Users/Isabella GM/vocatus/auto cad/visor-bombas/tools/documentar.mjs>).

SHA-256: `e9fc7e1c20bbb46b7f407ab699d5eed3ae426df050dbc5d04edc0771751b2160`

Esta es una copia documental. Editar el original para cambiar el programa.

````javascript
import {readFile,writeFile,mkdir,readdir,copyFile,rename,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const APP=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const WORK=path.dirname(APP), VAULT=path.join(WORK,'autocad el vieno vovatus');
const PROJECT=path.join(VAULT,'00-Proyecto'), DOC=path.join(PROJECT,'Documentacion-visor');
const DATE='2026-10-07';
const hash=b=>createHash('sha256').update(b).digest('hex');
const slash=p=>p.replaceAll('\\','/');
const exists=async p=>{try{await stat(p);return true;}catch(e){if(e.code==='ENOENT')return false;throw e;}};
async function save(p,s){await mkdir(path.dirname(p),{recursive:true});await writeFile(p,s);}
const note=(name,text)=>save(path.join(DOC,name+'.md'),`---\nactualizado: ${DATE}\nestado: documentacion\n---\n\n${text}\n`);

// Movimientos de archivos propios, nunca de carpetas ni datos del usuario.
const retired=[['update-demo.mjs','archivo/parches/update-demo.mjs'],['fix-selection.mjs','archivo/parches/fix-selection.mjs'],['auditar_exportador.py','archivo/auditorias/auditar_exportador.py'],['public/app.js.respaldo','archivo/respaldos/app.js.respaldo']];
for(const [from,to] of retired){
 const src=path.resolve(APP,from),dst=path.resolve(APP,to);
 if(!src.startsWith(APP+path.sep)||!dst.startsWith(APP+path.sep))throw new Error('Movimiento fuera del proyecto');
 if(await exists(src)){
  if(await exists(dst))throw new Error('El archivo histórico ya existe: '+dst);
  await mkdir(path.dirname(dst),{recursive:true});await rename(src,dst);
 }
}
await save(path.join(APP,'archivo/README.md'),`# Archivo histórico\n\nEstos archivos se conservan como referencia y no se ejecutan para iniciar ni actualizar el visor.\n\n- parches/update-demo.mjs: parche de una sola ejecución, ya aplicado.\n- parches/fix-selection.mjs: parche de selección, ya aplicado.\n- auditorias/auditar_exportador.py: prueba de un adjunto antiguo; depende de su ruta original. No valida la versión actual.\n- respaldos/app.js.respaldo: copia previa a realismo y a los cambios posteriores. No reemplazar el app.js actual con ella.\n\nMovidos el ${DATE}. Las rutas internas históricas se conservan, sin promesa de ejecución desde este archivo.\n`);
let readme=await readFile(path.join(APP,'README.md'),'utf8');
readme=readme.replace('`update-demo.mjs` y `fix-selection.mjs` son parches históricos ya aplicados; no son pasos de instalación ni deben ejecutarse de nuevo.','Los parches ya aplicados, la auditoría antigua y el respaldo de app.js están en `archivo/`. No se ejecutan para instalar o iniciar el visor.');
if(!readme.includes('node test-layout.mjs'))readme=readme.replace('- `node test-demo.mjs`','- `node test-layout.mjs`: separación geométrica de tanques, bombas y pedestales.\n- `node test-demo.mjs`');
if(!readme.includes('tools/documentar.mjs'))readme+='\n## Documentación en Obsidian\n\nAbrir `00-Proyecto/Documentacion-visor/00-Inicio.md` en la bóveda real. Incluye manual, arquitectura, pruebas, pendientes y código completo propio en notas legibles. `node tools/documentar.mjs` regenera el inventario y la copia documental de la revisión del 2026-10-07; no ejecuta pruebas. Antes de una nueva revisión, actualizar su fecha y conclusiones. La copia documental no es la aplicación activa.\n';
await writeFile(path.join(APP,'README.md'),readme);

await note('00-Inicio',`# Visor de mantenimiento — documentación central

Estado revisado el **${DATE}**. Empezar aquí para retomar el proyecto o entregarlo a otra persona.

## Navegación

- [[01-Estado-y-alcance]] — qué existe y qué falta.
- [[02-Manual-de-uso]] — abrir, presentar, registrar e introducir Gemini.
- [[03-Arquitectura-y-datos]] — archivos, API, modelo de datos y separación de modos.
- [[04-Decisiones-y-cambios]] — evolución desde los planos hasta la propuesta.
- [[05-Pruebas-y-limitaciones]] — evidencia y límites de validación.
- [[06-Pendientes-y-migracion]] — trabajo pendiente y revisión del exportador.
- [[07-Codigo-indice]] — código activo, herramientas, pruebas, archivo y dependencias.
- [[08-Archivo-historico]] — lo que ya no se usa y las versiones anteriores.
- [[09-Auditoria-documental]] — huecos y contradicciones encontrados.
- [[10-Entrega-y-continuidad]] — cómo continuar sin confundir código ni datos.

## Regla de edición

El código ejecutable está en **${slash(APP)}**. Las notas de Código y las copias de Fuentes son una fotografía documental. Editar una copia documental no cambia el visor.

Se conserva el material anterior y se indica cuándo es histórico. No se copian credenciales ni configuraciones privadas de Obsidian o Claude.
`);
await note('01-Estado-y-alcance',`# Estado y alcance

## Objetivo vigente

Propuesta local para presentar una aplicación de mantenimiento: planta vista desde arriba → selección y acercamiento a una bomba → despiece → consulta de componentes, ficha e historial. Si se aprueba, adaptar a la instalación real.

## Implementado

- Node.js sirve la web en http://127.0.0.1:8766, solo en esta PC.
- Three.js representa una distribución y una bomba genéricas, con 10 componentes seleccionables.
- Modo demo: P-9001 Agua y P-9002 Alcohol, totalmente ficticias. No acreditan aptitud de un equipo para alcohol.
- Modo real: 15 fichas de la bóveda de Obsidian; lectura directa del sistema de archivos, sin plugin REST/MCP de Obsidian instalado por este trabajo.
- Fichas YAML, o-rings, sellos, documentos vinculados, impresión desde el navegador e historial.
- Nuevos informes Markdown; separación física de datos reales y de prueba.
- Capa de realismo aportada por Claude: entorno, luces, sombras, materiales PBR y acabado de color.
- Selección corregida al cambiar de modo; coordenadas corregidas para evitar bombas dentro de tanques.
- Gemini integrado por REST, pero sin consulta real verificada: falta una clave API válida.

## No implementado o no validado

- CAD real por piezas, conversión de NWD, mediciones de fabricación o plano as-built.
- Sensores, diagnóstico predictivo, certificación de materiales o cálculo hidráulico.
- Usuarios, permisos por rol, stock transaccional, compras, mantenimiento preventivo programado o CMMS instalado.
- Carrito de repuestos, sincronización con CMMS y botón de exportación integrado al visor.
- Prueba visual completa del render: hubo bloqueo de la herramienta de navegador. La verificación geométrica es automatizada; no equivale a revisión visual.

Las notas de verificación previas documentan 15 TAG reales (9 fermentación, 6 destilación). No se volvió a auditar aquí cada plano. Las cifras antiguas de 20 bombas son resultados preliminares de OCR.
`);
await note('02-Manual-de-uso',`# Manual de uso

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
`);
await note('03-Arquitectura-y-datos',`# Arquitectura y datos

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
`);
await note('04-Decisiones-y-cambios',`# Decisiones y cambios

## Antecedentes documentados

Inventario de PDF/DWG/NWD; extracción de TAG y OCR; lista preliminar de hasta 20 bombas; revisión posterior que documentó 15. Se crearon fichas YAML, generador de notas, consulta por IA y exportador CMMS.

## 6 de octubre de 2026

- Se revisó la bóveda real y se recuperó el contexto del trabajo con Claude.
- El usuario pidió planta desde arriba, acercamiento, despiece, panel de mantenimiento e IA; eligió ejecución local y Gemini.
- Se construyó el visor Three.js y servidor Node.js, manteniendo las fichas en Obsidian.
- Se generó un ZIP temprano de código: no incluye las mejoras posteriores.
- Claude añadió realismo.js y respaldo del app.js anterior.
- Se creó demostración aislada de agua y alcohol, con dos fichas ficticias y datos suficientes para mostrar el flujo.
- Se corrigió el fallo ENOENT por selección de una bomba real en demo.
- Se diferenciaron los lanzadores y se reescribió el README.
- Se comprobó que una versión adjunta del exportador fallaba al excluir todos los activos demo.

## 7 de octubre de 2026

- Se volvió a iniciar la demostración.
- Se corrigieron bombas superpuestas a tanques: plant-layout.js define posiciones separadas, pedestales y distribución. La demo muestra un tanque por circuito y tuberías ilustrativas.
- Se añadió prueba geométrica para ambos modos.
- Revisión documental: el exportador local ya usa COLS_ACTIVOS y maneja cero activos; el error anterior corresponde a una versión archivada.
- Se reunieron manual, arquitectura, decisiones, pruebas, riesgos y código legible en Obsidian; se archivaron parches aplicados y respaldos.

## Decisiones vigentes

Demo primero, adaptación a planta después de aprobación. No instalar un CMMS todavía. No sustituir datos faltantes por suposiciones. Conservar Three.js por ahora; xeokit, Atlas, openMAINT y Odoo son referencias evaluadas, no integraciones realizadas.
`);
await note('05-Pruebas-y-limitaciones',`# Pruebas y límites

## Comprobaciones registradas

- test.mjs: 5 pruebas de lectura YAML, contexto, rutas, 15 fichas y control de peticiones.
- test-demo.mjs: dos fichas demo, selección inexistente con código PUMP_NOT_AVAILABLE, documento e informe temporal de prueba.
- test-layout.mjs: separación de cada pedestal respecto a cada tanque, ausencia de superposición entre pedestales y límites de plataforma, en modo demo y real.
- node --check: sintaxis de módulos activos.
- El servidor respondió por localhost con P-9001 y P-9002 durante la puesta en marcha.

El resultado de la verificación de esta revisión se guarda en [[Evidencia/Verificacion-2026-10-07]]. Si esa evidencia no aparece o contiene fallos, no asumir que se ejecutó con éxito.

## Qué no prueban

No prueban render visual, usabilidad en todos los dispositivos, compatibilidad química, exactitud geométrica, cumplimiento normativo ni diagnósticos de IA. No se ha completado una consulta real a Gemini por falta de clave.

La prueba de informes crea una nota temporal en demo y la elimina por su ruta exacta al terminar; no usa fichas reales. La prueba de rutas utiliza un caso absoluto Windows y no es portable tal cual a Linux.

Las pruebas de exportación usan carpetas de salida aisladas: no reemplazan los CSV existentes. La auditoría antigua en archivo/auditorias prueba un adjunto antiguo, no el script vigente.
`);
await note('06-Pendientes-y-migracion',`# Pendientes y migración

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
`);
await note('08-Archivo-historico',`# Archivo histórico

Los archivos retirados se conservan en visor-bombas/archivo. No se borró código de referencia ni se movieron módulos activos.

| Archivo | Motivo |
|---|---|
| parches/update-demo.mjs | Parche ya aplicado; repetirlo puede fallar o duplicar cambios. |
| parches/fix-selection.mjs | Parche de selección ya aplicado. |
| auditorias/auditar_exportador.py | Depende de un adjunto antiguo y de rutas anteriores. Evidencia histórica, no prueba vigente. |
| respaldos/app.js.respaldo | Copia anterior a realismo y mejoras posteriores; no es la app actual. |

Las fuentes recibidas por adjunto se conservan en Fuentes/Adjuntos-historicos, cada una con origen y estado en el índice de código. No reemplazan el exportador actual.

El ZIP visor-bombas-codigo-2026-10-06.zip se conserva como entrega temprana en Archivo/Entregas. Está desactualizado: no usarlo como versión final del visor.

extract_tags.py permanece en su ruta original porque forma parte del trabajo técnico, pero conserva rutas de Linux y dependencias LibreDWG/ezdxf: no es ejecutable directamente en Windows sin adaptación. consultar_bombas.py es una alternativa CLI no usada por el servidor web; su proveedor/modelo requiere revisión antes de ejecutarlo.
`);
await note('09-Auditoria-documental',`# Auditoría documental

## Huecos cubiertos

- Manual completo de ambos modos y rutas de guardado.
- Capa de realismo y dependencia real de Three.js/Canvas.
- Arquitectura, endpoints y funcionamiento de Gemini.
- Errores corregidos de selección y superposición con tanques.
- Identificación de código activo, pruebas, herramientas, respaldos y parches antiguos.
- Código propio legible en notas, más fuentes sin modificar y manifiesto SHA-256.
- Distinción entre implementación, validación automática, validación visual pendiente y mejoras futuras.

## Notas anteriores revisadas

- 00-Indice: enlace prioritario a la documentación vigente.
- 13-Base-de-conocimiento-IA: alcance actualizado y generación de las 15 notas reconocida.
- 14-Migracion-a-CMMS: advertencia visible sobre diferencias con el visor y estado del exportador.
- 15-Referencia-RapidCatalog: referencia histórica, no equivalencia demostrada ni garantía de disponibilidad de CAD, costos o cobertura porcentual.
- 06, 08 y 09: se identifican como diagnóstico/plan anterior a la verificación de 15 bombas.

Las notas antiguas se conservan para trazabilidad; sus afirmaciones comerciales o técnicas no se revalidan aquí contra fuentes externas. El estado vigente lo define esta documentación junto con la evidencia local.

## Límites del archivo documental

No se extrajeron conversaciones completas de Claude ni configuraciones privadas. Se incluyen las fuentes del proyecto y adjuntos de código compartidos en este chat. No se inventaron versiones de código que no estaban guardadas.
`);
await note('10-Entrega-y-continuidad',`# Entrega y continuidad

## Para otra persona o agente

1. Leer [[01-Estado-y-alcance]] y [[06-Pendientes-y-migracion]].
2. Abrir [[07-Codigo-indice]]; editar los originales activos, no las notas de código.
3. Para presentar, iniciar demostración. Para trabajar con la planta, iniciar visor real.
4. Confirmar que no hay otro agente editando el mismo archivo; no sobrescribir cambios sin leerlo.
5. Ejecutar pruebas adecuadas después de cambiar lógica, datos o geometría.
6. Actualizar esta documentación y regenerar la fotografía de fuentes después de una revisión. El generador conserva fecha y conclusiones explícitas; actualizarlas para una nueva revisión.

## Respaldo

Respaldar por separado la aplicación y la bóveda real. El ZIP temprano es histórico. La carpeta Fuentes de esta documentación incluye código y datos demo, pero no sustituye el respaldo de todas las fichas, informes y planos reales. No contiene claves API.

## Edición documental

Código activo: ${slash(APP)}

Bóveda real: ${slash(VAULT)}

La copia documental se registra por ruta, categoría, tamaño y SHA-256 en manifiesto-fuentes.json. Los archivos de dependencias se copian con sus licencias; no se vuelcan miles de líneas de librerías de terceros en una nota.
`);

// Catálogo y fotografía verificable de código y archivos auxiliares.
const descriptions={
 'server.mjs':'Servidor HTTP, lectura de bóveda, documentos, informes y Gemini.',
 'public/app.js':'Interfaz, escenas Three.js, selección de equipos, panel e interacción.',
 'public/realismo.js':'Capa de iluminación, entorno, materiales PBR y sombras de Claude.',
 'public/plant-layout.js':'Distribución geométrica de tanques y bombas sin superposición.',
 'public/index.html':'Estructura de la página, paneles y diálogos.',
 'public/style.css':'Estilos, diseño adaptable e impresión.',
 'setup.mjs':'Descarga de dependencias con versiones fijadas.',
 'test.mjs':'Pruebas del servidor con las fichas reales.',
 'test-demo.mjs':'Prueba de demostración y registro de informes aislados.',
 'test-layout.mjs':'Prueba de separación geométrica y plataforma.',
 'crear_notas_bombas.py':'Generador de fichas a partir de CSV; conserva notas existentes.',
 'consultar_bombas.py':'Consulta CLI anterior; no es el backend del visor.',
 'exportar_cmms.py':'Exportador independiente; ver limitaciones de integración.',
 'extract_tags.py':'Herramienta de extracción DWG con rutas del entorno Linux original.'
};
async function walk(dir){let result=[];for(const e of await readdir(dir,{withFileTypes:true})){if(e.name==='node_modules'||e.name==='.git'||e.name.startsWith('.env'))continue;const p=path.join(dir,e.name);if(e.isDirectory())result.push(...await walk(p));else if(e.isFile())result.push(p);}return result;}
const records=[];
for(const file of await walk(APP)){
 const relative=slash(path.relative(APP,file));
 if(!/\.(mjs|js|py|cmd|css|html|json|md|txt|respaldo)$/.test(relative))continue;
 const category=relative.startsWith('archivo/')?'Archivo':relative.includes('vendor/')?'Dependencias':relative.startsWith('test')?'Pruebas':relative.startsWith('demo-vault/')?'Datos-demo':relative.startsWith('tools/')||relative==='setup.mjs'?'Herramientas':'Activo';
 records.push({original:file,relative:'Visor/'+relative,category,description:descriptions[relative]||'Archivo del visor: '+relative});
}
for(const file of await walk(path.join(PROJECT,'scripts'))){if(!file.endsWith('.py'))continue;const name=path.basename(file);records.push({original:file,relative:'Scripts-Obsidian/'+name,category:'Scripts-Obsidian',description:descriptions[name]||'Script de la bóveda.'});}
for(const [id,name,description] of [
 ['d0aa3c5d-8caa-4818-87f0-5b57d85d45fa','exportador-inicial.py','Versión adjunta inicial: hash no estable y otras limitaciones históricas.'],
 ['a61243c1-4d82-4014-930e-50d77e85d94b','exportador-guarda-demo.py','Versión adjunta con guarda demo y fallo posterior por activos[0]; reemplazada por el script local.']
]){
 const file=path.join(process.env.USERPROFILE,'.codex','attachments',id,'Texto pegado.txt');
 if(await exists(file))records.push({original:file,relative:'Adjuntos-historicos/'+name,category:'Archivo',description});
}
const manifest=[],sections=new Map();
for(const rec of records.sort((a,b)=>a.relative.localeCompare(b.relative))){
 const bytes=await readFile(rec.original),destination=path.join(DOC,'Fuentes',rec.relative);
 await mkdir(path.dirname(destination),{recursive:true});await copyFile(rec.original,destination);
 const entry={...rec,sha256:hash(bytes),bytes:bytes.length,captured:DATE};manifest.push(entry);
 if(!sections.has(rec.category))sections.set(rec.category,[]);
 const ownCode=/\.(mjs|js|py|cmd|css|html|json|respaldo)$/.test(rec.relative)&&rec.category!=='Dependencias';
 const title=rec.relative.replaceAll('/',' — ').replaceAll('.','-');
 if(ownCode){
  const language=rec.relative.endsWith('.py')?'python':rec.relative.endsWith('.cmd')?'bat':rec.relative.endsWith('.css')?'css':rec.relative.endsWith('.html')?'html':rec.relative.endsWith('.json')?'json':'javascript';
  await save(path.join(DOC,'Codigo',rec.category,title+'.md'),`# ${rec.relative}\n\n${rec.description}\n\n**Categoría:** ${rec.category}. **Captura:** ${DATE}.\n\nOriginal: [abrir archivo](<${slash(rec.original)}>).\n\nSHA-256: \`${entry.sha256}\`\n\nEsta es una copia documental. ${rec.category==='Archivo'?'Código histórico; no ejecutar ni reponer sobre la aplicación actual.':'Editar el original para cambiar el programa.'}\n\n\`\`\`\`${language}\n${bytes.toString('utf8')}\n\`\`\`\`\n`);
  sections.get(rec.category).push(`- [[Codigo/${rec.category}/${title}|${rec.relative}]] — ${rec.description}`);
 }else sections.get(rec.category).push(`- [${rec.relative}](<Fuentes/${rec.relative}>) — ${rec.category==='Dependencias'?'Dependencia de terceros; fuente completa preservada con su licencia.':rec.description}`);
 if(hash(await readFile(destination))!==entry.sha256)throw new Error('Copia diferente: '+rec.relative);
}
await save(path.join(DOC,'manifiesto-fuentes.json'),JSON.stringify({revision:DATE,records:manifest},null,2));
await note('07-Codigo-indice',`# Índice de código y fuentes\n\n${manifest.length} archivos preservados. El código propio aparece completo dentro de notas legibles en Obsidian; las dependencias están disponibles como archivos originales. [Manifiesto de integridad](manifiesto-fuentes.json).\n\nLa copia no se actualiza sola. Original activo: ${slash(APP)}.\n\n`+[...sections].map(([name,rows])=>`## ${name}\n\n${rows.join('\n')}`).join('\n\n'));
const zip=path.join(WORK,'visor-bombas-codigo-2026-10-06.zip');
if(await exists(zip)){const target=path.join(DOC,'Archivo/Entregas',path.basename(zip));await mkdir(path.dirname(target),{recursive:true});await copyFile(zip,target);}
let index=await readFile(path.join(PROJECT,'00-Indice.md'),'utf8');
const banner='> [!important] Estado vigente — 7 de octubre de 2026\n> Abrir [[Documentacion-visor/00-Inicio|Documentación central del visor]]: manual, arquitectura, pruebas, pendientes y todo el código organizado. La prioridad actual es una demostración local de agua y alcohol; la adaptación a la planta queda para después de aprobación.\n\n';
if(!index.includes('Documentacion-visor/00-Inicio'))index=index.replace(/\n\n/, '\n\n'+banner);
await writeFile(path.join(PROJECT,'00-Indice.md'),index);
const updates={
 '06-Equipos-detectados.md':'Diagnóstico histórico de DWG. La lista posterior documenta 15 bombas; ver [[10-Verificacion-bombas]] y [[Documentacion-visor/01-Estado-y-alcance]].',
 '08-OCR-PID-resultados.md':'Resultado preliminar de OCR. Los candidatos de 17–20 no son el inventario final documentado; ver [[10-Verificacion-bombas]].',
 '09-Plan-de-Accion.md':'Cronograma histórico anterior al alcance demo. Sus 20 bombas y estimaciones no describen la propuesta vigente; ver [[Documentacion-visor/01-Estado-y-alcance]].',
 '13-Base-de-conocimiento-IA.md':'Alcance actualizado: Obsidian alimenta un visor 3D local; ambos forman el proyecto. Las 15 fichas ya existen. El script CLI descrito aquí es una alternativa anterior; el visor usa su propia integración Gemini. Ver [[Documentacion-visor/03-Arquitectura-y-datos]].',
 '14-Migracion-a-CMMS.md':'Leer [[Documentacion-visor/06-Pendientes-y-migracion]] antes de ejecutar o prometer una migración. El exportador local maneja cero activos, pero su carpeta/esquema de informes difieren del visor. Los IDs requieren revisión. No se garantiza tiempo de importación, compatibilidad universal ni clasificación normativa validada.',
 '15-Referencia-RapidCatalog.md':'Referencia histórica de diseño, no verificación comercial vigente. El visor tiene 10 componentes genéricos, sin importación CAD ni carrito. No se han comprobado aquí precios, cobertura del 80 %, equivalencia funcional ni disponibilidad gratuita de CAD. Ver [[Documentacion-visor/01-Estado-y-alcance]].'
};
for(const [filename,warning] of Object.entries(updates)){
 const p=path.join(PROJECT,filename);let s=await readFile(p,'utf8');
 if(!s.includes('Revisión documental 2026-10-07'))s=s.replace(/\n\n/,`\n\n> [!info] Revisión documental 2026-10-07\n> ${warning}\n\n`);
 if(filename.startsWith('13-'))s=s.replace('- [ ] Generar las 14 notas restantes','- [x] Generar las 14 notas restantes — 15 fichas presentes en la revisión del 2026-10-07');
 await writeFile(p,s);
}
console.log(JSON.stringify({documentacion:DOC,fuentes:manifest.length,notasCodigo:records.filter(r=>/\.(mjs|js|py|cmd|css|html|json|respaldo)$/.test(r.relative)&&r.category!=='Dependencias').length,archivados:retired.length},null,2));

````

import {datosDeExcel} from './asignacion-bombas.js';

const excepciones={
 B10:{nota:'El listado de placas indica que el equipo está fuera de la lista. Confirmar si sigue instalado.',bloqueo:true},
 B15:{nota:'El listado de placas indica que el equipo está fuera de la lista. Confirmar si sigue instalado.',bloqueo:true},
 B16:{nota:'El listado de placas indica que el equipo está fuera de la lista. Confirmar si sigue instalado.',bloqueo:true},
 B19:{marca:'DURCO',modelo:'LF-82 (62392)',fuente:'Placa de la bomba'},
 B44:{marca:'HIDROMAC',modelo:'AZ 3X4X12A SMCDV',fuente:'Placa de la bomba'},
 B45:{marca:'HIDROMAC',modelo:'AZ 3X4X12A SMCDV',fuente:'Placa de la bomba'},
 B51:{marca:'HIDROMAC',modelo:'LL-124 3X3',fuente:'Placa de la bomba',nota:'Serie 220106-2. Catálogo y despiece del fabricante pendientes.'},
 B52:{marca:'HIDROMAC',modelo:'LL-124 3X3',fuente:'Placa de la bomba',nota:'Serie 220106-1. Catálogo y despiece del fabricante pendientes.'},
 B56:{marca:'GOULDS',modelo:'NPE',fuente:'Placa de la bomba',nota:'El código completo de la variante requiere una lectura más clara.'},
 B57:{nota:'Inventario RA65/300 y placa archivada RSA 32/205. Confirmar la placa en este TAG.',bloqueo:true},
 B58:{marca:'',modelo:'',nota:'La placa PACO del archivo histórico podría corresponder al TAG actual B60. Confirmar en campo.',bloqueo:true},
 B59:{nota:'Se lee SB 15-5(M). Confirmar fabricante antes de usar un catálogo.',bloqueo:true},
 B60:{marca:'PACO',modelo:'',nota:'El cruce histórico apunta a la familia LF. Confirmar la placa en B60 antes de asociar su catálogo.',bloqueo:true},
 B61:{nota:'Inventario Multisteel y placa archivada Titan 4196. Confirmar la placa en este TAG.',bloqueo:true},
 B62:{nota:'La placa archivada indica Titan 4196, sin correspondencia confirmada en el inventario actual.',bloqueo:true},
 B73:{marca:'KSB',modelo:'Movitec VF 4/8B',fuente:'Inventario y catálogo KSB'},
 B81:{marca:'TITAN',modelo:'4196 A20',fuente:'Placa archivada',nota:'Serie 064311. Confirmar la ubicación actual del TAG.'},
 B83:{marca:'TITAN',modelo:'4196 MT',fuente:'Placa archivada',nota:'Serie 064310. Confirmar la ubicación actual del TAG.'}
};
for(const [tag,tamaño] of Object.entries({B17:'6',B18:'6',B20:'6',B21:'8'})){
 excepciones[tag]={marca:'TITAN',modelo:'4196 ST',size:'1X1.5-'+tamaño+' ST',fuente:'Placa de la bomba',nota:'La placa identifica Titan 4196 ST. Contrastar los demás datos del Excel, donde figura Durco.'};
}
for(const tag of ['B39','B40','B41','B42','B43']){
 excepciones[tag]={marca:'GOULDS',modelo:'e-SH',nota:'El código del kit 15SH06K6 y el tamaño anotado apuntan a variantes distintas. Confirmar 15SH06 o 02SH06 en la placa.'};
}
for(const tag of ['B74','B75','B76']){
 excepciones[tag]={marca:'',modelo:'',nota:'El inventario identifica el motor de algunos conjuntos. La bomba y su catálogo están por confirmar.',bloqueo:true};
}
for(const tag of ['B77','B78','B79','B80']){
 excepciones[tag]={nota:'Figura SB 20-6(M) y hay discrepancias de instalación. Confirmar marca y ubicación antes de asociar un catálogo.',bloqueo:true};
}

export function identificarBomba(p,excel){
 if(!p||p.reemplazo||!excel)return p;
 if(p.identidadEditada){
  return {...p,marca:p.identidadEditada.marca||'',modelo:p.identidadEditada.modelo||'',identificacion:{fuente:'Datos guardados en la ficha',nota:'Identificación registrada en la ficha. Comparar con la placa antes de pedir repuestos.',bloqueo:false}};
 }
 const datos=datosDeExcel(excel);
 const {marca=datos.marca||'',modelo=datos.modelo||'',size,fuente='Inventario actual',nota='',bloqueo=false}=excepciones[p.tag]||{};
 return {...p,marca,modelo,...(size?{size}:{}),identificacion:{fuente,nota,bloqueo}};
}

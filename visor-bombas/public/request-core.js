export const known=v=>v!==false&&v!==true&&v!=null&&String(v).trim()!==''&&!/^(por confirmar|sin levantar|sin dato|pendiente)/i.test(String(v).trim());
export const joinDetails=(...parts)=>parts.filter(known).join(' · ');
// Solo elimina el token booleano erróneo, no palabras que contienen "false".
export const cleanDetail=value=>String(value??'').split(' · ').filter(s=>s.trim()!=='false').join(' · ');
export function cleanLegacyCart(cart){
 if(!Array.isArray(cart))return {items:[],changed:0};
 let changed=0;
 const items=cart.map(item=>{const detalle=cleanDetail(item.detalle);if(detalle!==String(item.detalle??''))changed++;return {...item,detalle};});
 return {items,changed};
}
// Convierte la ficha (P-xxxx o Bxx) en líneas de repuesto. Solo lo que está documentado.
export function partsOf(p) {
 const d = p.data, raw = d.documental || d, out = [];
 if (d.seal) { // Bxx: datos normalizados por el servidor
  const s = d.seal;
  if (known(s.tipo) || known(s.codigo)) out.push({pieza: 'Sello mecánico', detalle: joinDetails(s.tipo, known(s.diametro) && 'eje ' + s.diametro, known(s.caras) && 'caras ' + s.caras, known(s.elastomero) && s.elastomero), codigo: known(s.codigo) ? s.codigo : ''});
  for (const [lado, cod] of [['delantero', d.rodamientos?.delantero], ['trasero', d.rodamientos?.trasero]]) if (known(cod)) out.push({pieza: 'Rodamiento ' + lado, detalle: joinDetails(cod, known(d.rodamientos?.conjunto) && 'pertenece a ' + d.rodamientos.conjunto), codigo: cod});
  if (known(d.acople)) out.push({pieza: 'Elemento de acople', detalle: d.acople, codigo: ''});
 } else {
  if (known(d.tipo_sellado) || known(d.sello_modelo)) out.push({pieza: 'Sello mecánico', detalle: joinDetails(d.tipo_sellado, d.sello_marca, d.sello_modelo, known(d.sello_diametro_mm) && 'eje ' + d.sello_diametro_mm + ' mm', d.sello_elastomero), codigo: d.sello_codigo || d.codigo_bodega || ''});
 }
 if (known(raw.empaque_seccion_mm) || known(raw.empaque_tipo) || known(raw.empaque_declarado)) out.push({pieza: 'Empaquetadura', detalle: joinDetails(raw.empaque_tipo || raw.empaque_declarado, known(raw.empaque_seccion_mm) && 'sección ' + raw.empaque_seccion_mm + ' mm', known(raw.empaque_anillos) && raw.empaque_anillos + ' anillos'), codigo: '', cantidad: Number(raw.empaque_anillos) || 1});
 for (const o of Array.isArray(d.orings) ? d.orings : []) out.push({pieza: 'O-ring', detalle: joinDetails(o.posicion, o.medida, o.material), codigo: o.codigo || '', cantidad: Number(o.cantidad) || 1});
 return out.map(i => ({...i, tag: p.tag, cantidad: i.cantidad || 1}));
}

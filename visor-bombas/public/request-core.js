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

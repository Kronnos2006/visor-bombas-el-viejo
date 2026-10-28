export const MAX_EVIDENCE=4,MAX_EVIDENCE_BYTES=500*1024;
export function evidenceMime(bytes){
 if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return 'image/jpeg';
 if([137,80,78,71,13,10,26,10].every((n,i)=>bytes[i]===n))return 'image/png';
 if(String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP')return 'image/webp';
 return null;
}
export function normalizeEvidence(items=[]){
 if(!Array.isArray(items)||items.length>MAX_EVIDENCE)throw new Error('Podés adjuntar hasta 4 fotos por reporte.');
 return items.map(item=>{
  if(!item||!['image/jpeg','image/png','image/webp'].includes(item.mime)||typeof item.base64!=='string'||item.base64.length>Math.ceil(MAX_EVIDENCE_BYTES/3)*4||!item.base64.length||item.base64.length%4!==0||!/^[A-Za-z0-9+/]+={0,2}$/.test(item.base64))throw new Error('Foto inválida: usá JPG, PNG o WebP de hasta 500 KB por foto.');
  let binary;try{binary=atob(item.base64);}catch{throw new Error('La foto contiene datos inválidos.');}
  if(binary.length>MAX_EVIDENCE_BYTES||evidenceMime(Uint8Array.from(binary.slice(0,16),x=>x.charCodeAt(0)))!==item.mime)throw new Error('El contenido de la foto no coincide con un JPG, PNG o WebP válido.');
  const name=String(item.name||'evidencia').replace(/[\r\n]/g,' ').trim();if(!name||name.length>160)throw new Error('El nombre de la foto supera 160 caracteres.');
  return {name,mime:item.mime,base64:item.base64};
 });
}
export const evidenceBytes=item=>Math.floor(item.base64.length*3/4)-(item.base64.endsWith('==')?2:item.base64.endsWith('=')?1:0);

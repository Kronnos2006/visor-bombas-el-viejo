const MAX_SOURCE_BYTES=32*1024*1024;
export async function isHeicPhoto(file){
 if(/\.(heic|heif)$/i.test(file?.name||'')||/^image\/hei[cf](?:-sequence)?$/i.test(file?.type||''))return true;
 if(!file?.slice)return false;
 const header=new Uint8Array(await file.slice(0,64).arrayBuffer());
 const text=String.fromCharCode(...header);
 return text.slice(4,8)==='ftyp'&&/heic|heix|hevc|hevx|heim|heis|mif1|msf1/.test(text.slice(8));
}
let converter;
async function convertHeic(file){
 if(!converter)converter=import('./vendor/heic-to.js').catch(error=>{converter=null;throw error;});
 const {heicTo}=await converter;
 return heicTo({blob:file,type:'bitmap'});
}
export async function decodePhoto(file,{native=blob=>createImageBitmap(blob),heic=convertHeic}={}){
 if(!file||!file.size)throw Error('Elegí una foto con contenido.');
 if(file.size>MAX_SOURCE_BYTES)throw Error('La foto supera 32 MB. Elegí una de menor tamaño.');
 try{return await native(file);}catch(error){
  if(!await isHeicPhoto(file))throw Error('No se pudo abrir esta imagen. Probá con otra foto JPEG, PNG o WebP.');
  try{return await heic(file);}catch{throw Error('No se pudo convertir esta foto HEIC/HEIF. La foto anterior se conserva. Reintentá o elegí una copia JPEG.');}
 }
}

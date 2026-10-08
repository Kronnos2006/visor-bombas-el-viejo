// Reportes de campo: se guardan en este navegador (IndexedDB). El servidor demo de Vercel es de solo lectura,
// por lo que los reportes NO se comparten entre equipos hasta conectar un almacenamiento en la nube.
const DB='vocatus-reportes',STORE='reportes',MAX_PDF=10*1024*1024;
let dbp=null;
function open(){
  if(dbp)return dbp;
  dbp=new Promise((ok,fail)=>{
    if(!window.indexedDB){fail(new Error('Este navegador no permite guardar reportes locales.'));return;}
    const r=indexedDB.open(DB,1);
    r.onupgradeneeded=()=>{const s=r.result.createObjectStore(STORE,{keyPath:'id'});s.createIndex('tag','tag');};
    r.onsuccess=()=>ok(r.result);r.onerror=()=>fail(r.error||new Error('No se pudo abrir el almacenamiento local.'));
  });
  return dbp;
}
const tx=async(mode,fn)=>{const db=await open();return new Promise((ok,fail)=>{const t=db.transaction(STORE,mode),out=fn(t.objectStore(STORE));t.oncomplete=()=>ok(out?.result);t.onerror=()=>fail(t.error);t.onabort=()=>fail(t.error);});};
export const listReports=async tag=>{const all=await tx('readonly',s=>s.index('tag').getAll(tag));return (all||[]).sort((a,b)=>(b.date||'').localeCompare(a.date||'')||b.created-a.created);};
export async function addReport({tag,date,title,text,file}){
  if(!title?.trim())throw new Error('Escribí un título.');
  if(!text?.trim()&&!file)throw new Error('Escribí el reporte o adjuntá un PDF.');
  if(file){
    if(file.type!=='application/pdf'&&!/\.pdf$/i.test(file.name))throw new Error('El archivo debe ser PDF.');
    if(file.size>MAX_PDF)throw new Error('El PDF supera 10 MB.');
  }
  const rec={id:(crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random()),tag,date,title:title.trim(),text:(text||'').trim(),created:Date.now(),
    pdf:file?{name:file.name,size:file.size,blob:file}:null};
  await tx('readwrite',s=>s.add(rec));return rec;
}
export const deleteReport=id=>tx('readwrite',s=>s.delete(id));

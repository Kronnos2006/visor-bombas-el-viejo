const adminFiles=new Set(['admin-planta','admin-planta.html','admin-planta.js','admin-planta.css','admin-planta-core.js','admin-planta-xlsx.js']);

export function isPumpEditorPath(pathname){
 try{
  const parts=decodeURIComponent(pathname).replaceAll('\\','/').split('/').filter(Boolean);
  return adminFiles.has(parts.at(-1)?.toLowerCase().replace(/[. ]+$/,''))||parts.join('/')==='api/admin/plant';
 }catch{return false;}
}

const adminFiles=new Set(['ubicar-bombas','ubicar-bombas.html','ubicar-bombas.js','ubicar-bombas-core.js','ubicar-bombas.css','plano-bombas.json','admin-planta','admin-planta.html','admin-planta.js','admin-planta.css','admin-planta-core.js','admin-planta-xlsx.js']);

export function isPumpEditorPath(pathname){
 try{
  const parts=decodeURIComponent(pathname).replaceAll('\\','/').split('/').filter(Boolean);
  return adminFiles.has(parts.at(-1)?.toLowerCase().replace(/[. ]+$/,''))||parts.join('/')==='api/admin/plant';
 }catch{return false;}
}

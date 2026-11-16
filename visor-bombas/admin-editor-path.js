const editorFiles=new Set(['ubicar-bombas','ubicar-bombas.html','ubicar-bombas.js','ubicar-bombas-core.js','ubicar-bombas.css','plano-bombas.json']);

export function isPumpEditorPath(pathname){
 try{
  const parts=decodeURIComponent(pathname).replaceAll('\\','/').split('/').filter(Boolean);
  return editorFiles.has(parts.at(-1)?.toLowerCase().replace(/[. ]+$/,''));
 }catch{return false;}
}

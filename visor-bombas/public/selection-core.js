// Identidad de interfaz: una referencia sin TAG nunca se convierte en un TAG inventado.
export function referenceKey(reference){
 if(!reference||typeof reference.sector!=='string'||typeof reference.nombre!=='string')return '';
 return 'integrado:'+reference.sector+':'+reference.nombre;
}
export function selectionIdentity(selection){
 if(selection?.pending){const key=referenceKey(selection.pending);return key?'reference:'+key:'';}
 return /^(B[1-9]\d{0,3}|P-\d{4}[A-Z]?)$/.test(selection?.tag||'')?'tag:'+selection.tag:'';
}

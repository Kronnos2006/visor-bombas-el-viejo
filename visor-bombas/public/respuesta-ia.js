// Convierte la respuesta de Gemini (texto con marcas tipo Markdown) en HTML seguro y fácil de leer.
// Primero se escapa todo el texto; después solo se agregan etiquetas propias. Nunca se inserta HTML de la respuesta.
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const enLinea=t=>esc(t)
 .replace(/`([^`\n]+)`/g,'<code>$1</code>')
 .replace(/\*\*([^*\n]+?)\*\*/g,'<strong>$1</strong>')
 .replace(/(^|[\s(])\*([^*\s][^*\n]*?)\*(?=[\s).,;:]|$)/g,'$1<em>$2</em>');
export function respuestaIaHtml(texto){
 const lineas=String(texto??'').replace(/\r/g,'').split('\n');
 const html=[];let lista=null,parrafo=[];
 const cierraParrafo=()=>{if(parrafo.length){html.push('<p>'+parrafo.map(enLinea).join('<br>')+'</p>');parrafo=[];}};
 const cierraLista=()=>{if(lista){html.push(`<${lista.tipo}>`+lista.items.map(i=>`<li>${enLinea(i)}</li>`).join('')+`</${lista.tipo}>`);lista=null;}};
 for(const bruta of lineas){
  const l=bruta.trim();
  if(!l){cierraParrafo();cierraLista();continue;}
  if(/^(-{3,}|\*{3,}|_{3,})$/.test(l)){cierraParrafo();cierraLista();html.push('<hr>');continue;}
  const t=l.match(/^#{1,6}\s+(.*)$/);
  if(t){cierraParrafo();cierraLista();html.push(`<h4>${enLinea(t[1])}</h4>`);continue;}
  const solo=l.match(/^\*\*([^*]+?)\*\*:?$/);
  if(solo){cierraParrafo();cierraLista();html.push(`<h4>${enLinea(solo[1])}</h4>`);continue;}
  const v=l.match(/^[*•-]\s+(.*)$/),n=l.match(/^\d+[.)]\s+(.*)$/);
  if(v||n){cierraParrafo();const tipo=n?'ol':'ul';if(lista&&lista.tipo!==tipo)cierraLista();(lista||(lista={tipo,items:[]})).items.push((v||n)[1]);continue;}
  cierraLista();parrafo.push(l);
 }
 cierraParrafo();cierraLista();
 return html.join('');
}

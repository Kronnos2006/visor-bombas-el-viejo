export const VERIFICATION_SCOPES={identidad:'Identidad',placa:'Placa',repuestos:'Repuestos'};
export function validCalendarDate(value){
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
 const d=new Date(value+'T00:00:00Z');
 return !Number.isNaN(d.valueOf())&&d.toISOString().slice(0,10)===value;
}
export function verificationOf(data={}){
 const d=data.documental||data,records=d.verificaciones_campo||{},scopes={};
 for(const [key,label] of Object.entries(VERIFICATION_SCOPES)){
  const r=records[key]||{};
  scopes[key]={...r,label,verified:r.vigente===true&&typeof r.author==='string'&&r.author.trim()!==''&&validCalendarDate(r.date)&&typeof r.evidence==='string'&&r.evidence.trim()!==''};
 }
 const confirmed=Object.values(scopes).filter(r=>r.verified),latest=[...confirmed].sort((a,b)=>b.date.localeCompare(a.date))[0];
 const legacy=!!(d.verificado_por||d.fecha_verificacion);
 return {scopes,count:confirmed.length,verified:confirmed.length===3,partial:confirmed.length>0&&confirmed.length<3,legacy,author:latest?.author||'',date:latest?.date||''};
}
export function verificationText(v){
 const parts=Object.values(v.scopes||{}).filter(r=>r.verified).map(r=>r.label);
 if(parts.length)return 'Verificado: '+parts.join(' · ')+(v.verified?'':' · verificación parcial');
 return v.legacy?'Registro antiguo · requiere revisión':'Sin verificación explícita';
}

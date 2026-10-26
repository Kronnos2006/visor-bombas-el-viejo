import {verificationOf} from './interfaz-core.js';
export function documentationProgress(row){
 const checks=Object.fromEntries(Object.entries(row.checks||{}).filter(([k])=>k!=='verificado'));
 const applicable=Object.values(checks).filter(v=>v!==null);
 const total=applicable.length,done=applicable.filter(v=>v===true).length;
 const v=row.verification||{};
 return {...row,checks,done,total,percent:total?Math.round(done/total*100):0,verification:v.scopes?v:verificationOf({verificado_por:v.author,fecha_verificacion:v.date})};
}
export function filterProgress(rows,{kind='',only='',verified=''}={}){
 return rows.map(documentationProgress).filter(r=>(!kind||r.kind===kind)&&(!only||(only==='done')===(r.done===r.total))&&(!verified||(verified==='yes')===r.verification.verified));
}

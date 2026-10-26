import {validCalendarDate,VERIFICATION_SCOPES} from './verification-core.js';
export {validCalendarDate};
export const NUMERIC_RULES={caudal:{min:0,max:1e9},altura:{min:0,max:1e6},impulsor:{min:0,max:10000,exclusive:true},motor_hp:{min:0,max:1e7,exclusive:true},motor_kw:{min:0,max:1e7,exclusive:true},motor_rpm:{integer:true,min:1,max:100000},rpm:{integer:true,min:1,max:100000},empaque_anillos:{integer:true,min:1,max:100},sello_diametro:{min:0,max:10000,exclusive:true},empaque_seccion:{min:0,max:1000,exclusive:true}};
// Permite medidas mixtas de placa como 1.3/8 o 1 3/8, sin aceptar texto arbitrario.
export function normalizeNumeric(id,value){
 let text=String(value??'').trim().replace(',','.');
 const rule=NUMERIC_RULES[id];if(!rule||!text)return text;
 if(id==='sello_diametro'){
  const fraction=/^(?:(\d+)[ .])?(\d+)\/(\d+)$/.exec(text);
  if(fraction){const denominator=Number(fraction[3]);if(!denominator)throw Error('Diámetro: el denominador no puede ser cero.');text=String(Number(fraction[1]||0)+Number(fraction[2])/denominator);}
 }
 if(!/^\d+(?:\.\d+)?$/.test(text))throw Error(id+': escribí un número válido, sin signos ni texto.');
 const n=Number(text);
 if(!Number.isFinite(n)||n<rule.min||(rule.exclusive&&n===rule.min)||n>rule.max||(rule.integer&&!Number.isInteger(n)))throw Error(id+': valor fuera de rango'+(rule.integer?' o cantidad no entera.':'.'));
 return String(n);
}
export function validateSurveyInput(input){
 if(!validCalendarDate(input.date)||!String(input.author||'').trim())throw Error('Completá una fecha real y quién hizo el levantamiento.');
 const fields={...input.fields};
 if(String(fields.motor_hp||'').trim()&&String(fields.motor_kw||'').trim())throw Error('Registrá la potencia del motor en HP o en kW, no ambas a la vez.');
 for(const key of Object.keys(NUMERIC_RULES))if(fields[key]!=null&&String(fields[key]).trim()!=='')fields[key]=normalizeNumeric(key,fields[key]);
 for(const o of input.orings||[])if(String(o.cantidad??'').trim()!==''&&(!/^\d+$/.test(String(o.cantidad).trim())||Number(o.cantidad)<1||Number(o.cantidad)>999))throw Error('O-rings: la cantidad debe ser un entero entre 1 y 999.');
 const verification=input.verification||{},selected=verification.scopes||[];
 if(!Array.isArray(selected)||selected.some(key=>!Object.hasOwn(VERIFICATION_SCOPES,key)))throw Error('Alcance de verificación inválido.');
 if(selected.length&&!String(verification.evidence||'').trim())throw Error('Describí la evidencia de lo que verificaste en campo.');
 return {fields,scopes:[...new Set(selected)],evidence:String(verification.evidence||'').trim().slice(0,1000)};
}

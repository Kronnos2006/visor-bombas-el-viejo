import {cloudPhotoConfig} from './cloud-photos-config.js';
import {loadSharedPhotoRows} from './cloud-photo-core.js';
let clientPromise,session=null,permissions=null,initPromise;
let permissionGeneration=0,permissionRequest=null,permissionOwner=null,permissionUntil=0;
const snapshots=new Map(),downloads=new Map(),watchers=new Map();
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const notify=entity=>document.dispatchEvent(new CustomEvent('vocatus:cloud-photos',{detail:{entity}}));
const changed=()=>document.dispatchEvent(new Event('vocatus:cloud-auth'));
export const cloudEnabled=()=>typeof window!=='undefined'&&cloudPhotoConfig.enabled;
async function client(){
 if(!clientPromise)clientPromise=import('./vendor/supabase.js').then(({createClient})=>createClient(cloudPhotoConfig.url,cloudPhotoConfig.key,{auth:{storageKey:'vocatus-photo-session',persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}));
 return clientPromise;
}
function invalidatePermissions(){permissionGeneration++;permissions=null;permissionOwner=null;permissionUntil=0;permissionRequest=null;}
async function checkPermissions(){
 const owner=session?.user?.id;if(!owner){invalidatePermissions();return false;}
 if(permissions?.read&&permissionOwner===owner&&Date.now()<permissionUntil)return true;
 const generation=permissionGeneration,current=permissionRequest;
 if(current?.owner===owner&&current.generation===generation)return current.promise;
 permissions=null;permissionOwner=null;permissionUntil=0;
 const job=(async()=>{
  const supabase=await client(),result=await supabase.rpc('vocatus_photo_permissions');
  if(generation!==permissionGeneration||session?.user?.id!==owner)throw Error('La cuenta cambió. Volvé a abrir las fotos.');
  if(result.error)throw result.error;
  if(!result.data?.read)throw Error('Esta cuenta todavía no está autorizada para las fotos de VOCATUS.');
  permissions=result.data;permissionOwner=owner;permissionUntil=Date.now()+30000;
  return true;
 })();
 const queued={owner,generation,promise:job};permissionRequest=queued;
 try{return await job;}finally{if(permissionRequest===queued)permissionRequest=null;}
}
export async function startCloudPhotos(){
 if(!cloudEnabled())return false;
 if(!initPromise)initPromise=(async()=>{
  const supabase=await client();const initial=await supabase.auth.getSession();session=initial.data.session;
  supabase.auth.onAuthStateChange((_event,next)=>{
   const previous=session?.user?.id;session=next;invalidatePermissions();
   if(previous!==next?.user?.id){snapshots.clear();for(const url of downloads.values())URL.revokeObjectURL(url);downloads.clear();}
   // Fuera del callback de Auth para no bloquear la renovación de la sesión.
   setTimeout(()=>{changed();for(const entity of watchers.keys())notify(entity);},0);
  });
  supabase.channel('vocatus-equipment-photos').on('postgres_changes',{event:'*',schema:'public',table:'vocatus_photos'},event=>{
   const entity=event.new?.entity_key||event.old?.entity_key;if(entity){snapshots.delete(entity);notify(entity);}
  }).subscribe();
  setInterval(()=>{if(session&&document.visibilityState==='visible')for(const entity of watchers.keys())notify(entity);},15000);
  window.addEventListener('online',()=>{for(const entity of watchers.keys())notify(entity);});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')for(const entity of watchers.keys())notify(entity);});
  return true;
 })().catch(error=>{initPromise=null;throw error;});
 await initPromise;return !!session;
}
export function cloudRevision(entity,slot){const rows=snapshots.get(entity);return rows?rows.find(row=>row.slot===slot)?.revision??0:undefined;}
export async function cloudSession(){await startCloudPhotos();if(!session)return null;await checkPermissions();return session;}
async function rows(entity){
 const owner=session?.user?.id,supabase=await client(),result=await supabase.from('vocatus_photos').select('*').eq('entity_key',entity);
 if(result.error)throw result.error;if(!owner||session?.user?.id!==owner)throw Error('La cuenta cambió. Volvé a abrir las fotos.');snapshots.set(entity,result.data||[]);return result.data||[];
}
export async function sharedPhotos(entity,{strict=false}={}){
 if(!await cloudSession())return Object.defineProperty({},'warning',{value:'Conectá tu cuenta autorizada en este navegador para ver las fotos que compartiste desde el teléfono.',enumerable:false});
 const owner=session?.user?.id,supabase=await client();
 return downloadRows(await rows(entity),supabase,owner,strict);
}
function downloadRows(photoRows,supabase,owner,strict=false){
 return loadSharedPhotoRows({rows:photoRows,strict,isCurrent:()=>session?.user?.id===owner,download:async row=>{
  let url=downloads.get(row.object_path);
  if(!url){const result=await supabase.storage.from('vocatus-photos').download(row.object_path);if(result.error)throw result.error;if(session?.user?.id!==owner)throw Error('La cuenta cambió. Volvé a abrir las fotos.');url=URL.createObjectURL(result.data);downloads.set(row.object_path,url);}
  return {url,fecha:row.updated_at,cloud:true,revision:row.revision,path:row.object_path,local:false};
 }});
}
export async function refreshAllSharedPhotos({onProgress=()=>{}}={}){
 if(!await cloudSession())throw Error('Conectá tu cuenta para actualizar todas las fotos en línea.');
 const owner=session.user.id,supabase=await client(),groups=new Map();
 const check=()=>{if(session?.user?.id!==owner)throw Error('La cuenta cambió. Volvé a actualizar las fotos.');};
 for(let offset=0;;offset+=200){
  const result=await supabase.from('vocatus_photos').select('*').order('entity_key').order('slot').range(offset,offset+199);
  check();if(result.error)throw result.error;
  for(const row of result.data||[]){if(!groups.has(row.entity_key))groups.set(row.entity_key,[]);groups.get(row.entity_key).push(row);}
  if((result.data||[]).length<200)break;
 }
 check();snapshots.clear();for(const [entity,photoRows]of groups)snapshots.set(entity,photoRows);
 let photos=0,failed=0,done=0;
 for(const photoRows of groups.values()){
  const loaded=await downloadRows(photoRows,supabase,owner);
  photos+=Object.keys(loaded).length;failed+=photoRows.length-Object.keys(loaded).length;
  onProgress({phase:'reading',done:++done,total:groups.size});
 }
 check();for(const entity of watchers.keys())notify(entity);
 return {photos,equipment:groups.size,failed};
}
export async function connectCloudPhotos(){await openAccount();}
export async function cloudTransport(){
 const current=await cloudSession();if(!current)return null;if(!permissions.write)throw Error('Tu cuenta tiene permiso de consulta, no de actualización.');
 const supabase=await client();
 return {userId:current.user.id,
  async upload(path,blob){const result=await supabase.storage.from('vocatus-photos').upload(path,blob,{contentType:blob.type,upsert:false});if(result.error&&String(result.error.statusCode)!=='409')throw result.error;},
  async publish(entity,slot,expected,path){const result=await supabase.rpc('vocatus_publish_photo',{p_entity:entity,p_slot:slot,p_expected:expected,p_path:path});if(result.error)throw result.error;snapshots.delete(entity);notify(entity);return result.data?.[0];},
  async readOne(entity,slot){return (await rows(entity)).find(row=>row.slot===slot);}
 };
}
function statusText(entity){const known=snapshots.get(entity);const count=known?' Fotos confirmadas para esta bomba: '+known.length+'.':'';if(session&&!permissions)return 'Cuenta conectada: '+session.user.email+'. Comprobando autorización…';return session?(permissions?.read===false?'Cuenta no autorizada':`Cuenta conectada: ${session.user.email}. Fotos compartidas con miembros autorizados.${count}`):'Conectá tu cuenta para compartir fotos automáticamente entre dispositivos autorizados.';}
export function cloudPhotoControls(entity){return !cloudEnabled()?'':`<section class="cloud-photo-controls" data-cloud-entity="${esc(entity)}"><strong>Fotos compartidas en línea</strong><p data-cloud-state role="status">${esc(statusText(entity))}</p><button type="button" data-cloud-connect>${session?'Cambiar o cerrar cuenta':'Conectar mi cuenta'}</button><button type="button" data-cloud-refresh>Actualizar fotos en línea</button><button type="button" data-cloud-pending ${session?'':'hidden'}>Compartir fotos locales pendientes</button><p data-cloud-result role="status"></p></section>`;}
const bindings=new WeakMap();
export function bindCloudPhotoControls(root,entity,{refresh,flush,resolve,details}={}){
 if(!cloudEnabled())return;const box=root.querySelector('.cloud-photo-controls');if(!box)return;
 const previous=bindings.get(root);previous?.abort();const controller=new AbortController();bindings.set(root,controller);
 watchers.set(entity,(watchers.get(entity)||0)+1);
 controller.signal.addEventListener('abort',()=>{const n=watchers.get(entity)-1;n>0?watchers.set(entity,n):watchers.delete(entity);});
 const live=()=>root.isConnected&&root.querySelector('.cloud-photo-controls')?.dataset.cloudEntity===entity;
 let updating=false;const update=async()=>{if(!live()){controller.abort();return;}if(updating)return;updating=true;try{await refresh?.();if(live())root.querySelector('[data-cloud-state]').textContent=statusText(entity);}catch(error){if(live())root.querySelector('[data-cloud-result]').textContent=error.message;}finally{updating=false;}};
 const authenticate=()=>{if(!live()){controller.abort();return;}const active=root.querySelector('.cloud-photo-controls');active.querySelector('[data-cloud-state]').textContent=statusText(entity);active.querySelector('[data-cloud-pending]').hidden=!session;update();};
 document.addEventListener('vocatus:cloud-photos',event=>{if(event.detail.entity===entity)update();},{signal:controller.signal});
 document.addEventListener('vocatus:cloud-auth',authenticate,{signal:controller.signal});
 box.querySelector('[data-cloud-connect]').onclick=()=>openAccount();
 const syncAndRefresh=async event=>{const button=event?.currentTarget||box.querySelector('[data-cloud-pending]');button.disabled=true;try{const result=await flush?.(entity);await update();if(live())root.querySelector('[data-cloud-result]').textContent=result||'Fotos comprobadas.';}catch(error){if(live())root.querySelector('[data-cloud-result]').textContent=error.message;}finally{button.disabled=false;}};
 box.querySelector('[data-cloud-refresh]').onclick=syncAndRefresh;
 box.querySelector('[data-cloud-pending]').onclick=syncAndRefresh;
 const detailBox=document.createElement('div');box.append(detailBox);
 details?.().then(items=>{if(!live())return;detailBox.innerHTML=items.map(item=>`<p><strong>${esc(item.name)}:</strong> ${esc(item.error)} ${item.online?`<a href="${esc(item.online)}" target="_blank" rel="noopener">Ver foto en línea</a>`:''}</p>${item.conflict?`<button type="button" data-cloud-resolve="${esc(item.slot)}" data-choice="online">Conservar foto en línea</button><button type="button" data-cloud-resolve="${esc(item.slot)}" data-choice="local">Reemplazar en línea con mi foto local</button>`:''}`).join('');detailBox.querySelectorAll('[data-cloud-resolve]').forEach(button=>button.onclick=async()=>{button.disabled=true;try{await resolve?.(entity,button.dataset.cloudResolve,button.dataset.choice);await update();}catch(error){box.querySelector('[data-cloud-result]').textContent=error.message;}finally{button.disabled=false;}});}).catch(()=>{});
 startCloudPhotos().then(async()=>{if(session)await checkPermissions();if(live()){box.querySelector('[data-cloud-state]').textContent=statusText(entity);box.querySelector('[data-cloud-pending]').hidden=!session;}}).catch(error=>{if(live())box.querySelector('[data-cloud-result]').textContent=error.message;});
 addStyles();
}
async function openAccount(){
 const supabase=await client();document.getElementById('vocatus-cloud-account')?.remove();
 const dialog=document.createElement('dialog');dialog.id='vocatus-cloud-account';dialog.className='cloud-account';
 dialog.innerHTML=`<form method="dialog"><button type="submit" class="cloud-close">Cerrar</button></form><h2>Fotos del equipo VOCATUS</h2><p>Solo los correos autorizados pueden consultar y actualizar las fotos. Usá tu cuenta en cada teléfono o computadora.</p>${session?`<p>Sesión: ${esc(session.user.email)}</p><button type="button" data-sign-out>Cerrar sesión</button>`:`<form data-login><label>Correo<input name="email" type="email" autocomplete="username" required></label><label>Contraseña<input name="password" type="password" autocomplete="current-password" minlength="8" required></label><button type="submit">Entrar</button><button type="button" data-register>Crear mi cuenta</button></form><p>Si creás una cuenta, confirmá tu correo antes de entrar.</p>`}<p role="status" data-login-status></p>`;
 document.body.append(dialog);dialog.showModal();dialog.querySelector('[data-sign-out]')?.addEventListener('click',async()=>{await supabase.auth.signOut();dialog.close();dialog.remove();});
 const form=dialog.querySelector('[data-login]');if(!form)return;
 async function sign(register=false){const status=dialog.querySelector('[data-login-status]');if(!form.reportValidity())return;for(const button of form.querySelectorAll('button'))button.disabled=true;status.textContent='Conectando…';
  try{const email=form.email.value.trim(),password=form.password.value;const result=register?await supabase.auth.signUp({email,password,options:{emailRedirectTo:cloudPhotoConfig.siteUrl+'?s=historial'}}):await supabase.auth.signInWithPassword({email,password});if(result.error)throw result.error;
   if(register&&!result.data.session){status.textContent='Revisá tu correo y confirmá la cuenta. Después volvé al visor para entrar.';return;}
   session=result.data.session;await checkPermissions();dialog.close();dialog.remove();changed();
  }catch(error){status.textContent=error.message;}finally{for(const button of form.querySelectorAll('button'))button.disabled=false;}
 }
 form.onsubmit=event=>{event.preventDefault();sign();};form.querySelector('[data-register]').onclick=()=>sign(true);
}
function addStyles(){if(document.getElementById('vocatus-cloud-style'))return;const style=document.createElement('style');style.id='vocatus-cloud-style';style.textContent=`.cloud-photo-controls{display:grid;gap:10px;padding:14px;margin:14px 0;border:1px solid var(--borde-fuerte,#9e813d);border-radius:10px;min-width:0}.cloud-photo-controls p{margin:0;font-size:14px;overflow-wrap:anywhere}.cloud-photo-controls button,.cloud-account button{min-height:44px;padding:8px 12px;cursor:pointer}.cloud-photo-controls [hidden]{display:none}.cloud-account{width:min(440px,calc(100vw - 32px));max-height:88dvh;overflow:auto;box-sizing:border-box;background:var(--fondo,#17150e);color:var(--tinta,#fff);border:1px solid var(--borde-fuerte,#9e813d);border-radius:14px;padding:20px}.cloud-account::backdrop{background:#000a}.cloud-account form[data-login]{display:grid;gap:14px}.cloud-account label{display:grid;gap:6px}.cloud-account input{width:100%;box-sizing:border-box;min-height:44px}.cloud-close{float:right}.cloud-account p{font-size:14px;line-height:1.5}`;document.head.append(style);}

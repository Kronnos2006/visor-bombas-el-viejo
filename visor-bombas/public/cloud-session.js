import {cloudPhotoConfig} from './cloud-photos-config.js';
import {createClient} from './vendor/supabase.js';
let promise;
// Una sola instancia por módulo; exactamente la clave de sesión de fotos existente.
export function sharedAccountClient(){return promise||(promise=Promise.resolve(createClient(cloudPhotoConfig.url,cloudPhotoConfig.key,{auth:{storageKey:'vocatus-photo-session',persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})));}
export async function acceptCloudSession(session){if(!session)return;const c=await sharedAccountClient();const r=await c.auth.setSession({access_token:session.access_token,refresh_token:session.refresh_token});if(r.error)throw r.error;}
export async function refreshCloudCookie(){
 const c=await sharedAccountClient(),r=await c.auth.getSession();if(!r.data.session)return false;
 const response=await fetch('/api/auth/sync',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({access_token:r.data.session.access_token})});return response.ok;
}
export async function startCloudAccount(){
 const c=await sharedAccountClient();
 c.auth.onAuthStateChange((event,session)=>{
  if(session&&['TOKEN_REFRESHED','SIGNED_IN'].includes(event))setTimeout(()=>refreshCloudCookie().catch(()=>{}),0);
 });
 return refreshCloudCookie();
}

// Solo servidor. Los clientes públicos y privilegiados nunca comparten sesión.
import {createClient} from '@supabase/supabase-js';
import {temporaryPassword} from './auth.mjs';
import {authorizeAccount} from './cloud-identity.mjs';
import {cloudPhotoConfig} from './public/cloud-photos-config.js';
export const CLOUD_COOKIE='vocatus_cloud_access';
const error=(message,status=400,code)=>Object.assign(new Error(message),{status,code});
const unwrap=result=>{if(result.error)throw error('No se pudo completar la operación de cuentas.',result.error.status===429?429:400);return result.data;};
export function cloudConfiguration(env=process.env){
 const url=env.SUPABASE_URL,key=env.SUPABASE_PUBLISHABLE_KEY,secret=env.SUPABASE_SECRET_KEY;
 if(!url||!key||!secret)throw error('Faltan variables privadas del servidor de cuentas.',503);
 if(!/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(url))throw error('URL de Supabase inválida.',503);
 if(url!==cloudPhotoConfig.url)throw error('El servidor debe usar el mismo proyecto Supabase que las fotos.',503);
 return {url,key,secret};
}
export const cloudToken=req=>String(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(CLOUD_COOKIE+'='))?.slice(CLOUD_COOKIE.length+1)||'';
export function createCloudAccess({config=cloudConfiguration(),factory=createClient}={}){
 const options={auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}};
 const service=factory(config.url,config.secret,options);
 const publicClient=()=>factory(config.url,config.key,options);
 const asUser=token=>factory(config.url,config.key,{...options,global:{headers:{Authorization:'Bearer '+token}}});
 const rpc=async(name,input)=>unwrap(await service.rpc(name,input));
 async function context(token){
  if(!token||token.length>16384)return null;
  const result=await publicClient().auth.getUser(token);
  if(result.error||!result.data?.user?.email_confirmed_at)return null;
  const account=unwrap(await asUser(token).rpc('vocatus_account'));
  if(!account||account.id!==result.data.user.id)return {identity:result.data.user,account:null,token};
  return {identity:result.data.user,account,token};
 }
 function approved(ctx){const a=ctx?.account;return !!(a&&a.status==='approved'&&a.active===true&&a.sessionValid===true&&['admin','usuario'].includes(a.role));}
 function requireAdmin(ctx){if(!approved(ctx)||ctx.account.mustChange||ctx.account.role!=='admin')throw error('Solo un administrador puede usar esta parte.',403,'ADMIN_ONLY');return ctx.account.id;}
 const manage=(actor,action,target=null,input={})=>rpc('vocatus_manage_account',{p_actor:actor,p_action:action,p_target:target,p_input:input});
 async function requestAccount(token,input){
  const result=await asUser(token).rpc('vocatus_request_access',{p_username:input.username,p_name:input.name});
  if(result.error?.message?.startsWith('Tu membresía de consulta sigue vigente.'))throw error('Tu acceso de consulta sigue vigente. Un administrador debe revisar tu perfil antes de habilitar escritura.',409,'MEMBER_PROFILE_REVIEW');
  return unwrap(result);
 }
 async function login(identifier,password){
  let email=String(identifier||'').trim().toLowerCase();
  if(!email.includes('@'))email=(await rpc('vocatus_account_email',{p_identifier:email}))?.email||'invalid-login@invalid.invalid';
  const result=await publicClient().auth.signInWithPassword({email,password:String(password||'')});
  if(result.error||!result.data.session)throw error('Usuario o contraseña incorrectos.',401);
  let ctx=await context(result.data.session.access_token);
  if(!ctx)throw error('No se pudo validar la sesión.',401);
  if(!ctx.account){
   const profile={username:ctx.identity.user_metadata?.requested_username,name:ctx.identity.user_metadata?.requested_name};
   if(!profile.username||!profile.name)return {ctx,session:result.data.session,needsProfile:true};
   try{await requestAccount(ctx.token,profile);}catch(e){if(e.code==='MEMBER_PROFILE_REVIEW')throw e;return {ctx,session:result.data.session,needsProfile:true};}
   ctx=await context(ctx.token);
   if(!ctx?.account)return {ctx,session:result.data.session,needsProfile:true};
  }
  return {ctx,session:result.data.session};
 }
 async function route({req,res,url,send,payload}){
  const path=url.pathname.slice('/api/auth/'.length);
  res.setHeader('Cache-Control','no-store');
  try{
   if(req.method!=='GET'&&req.method!=='POST')throw error('Método no permitido.',405);
   const origin=req.headers.origin,expected='https://'+req.headers['x-original-host'];
   if(req.method==='POST'&&(!origin||origin!==expected))throw error('Origen no permitido.',403);
   if(req.method==='POST'&&!String(req.headers['content-type']||'').startsWith('application/json'))throw error('Formato no permitido.',415);
   const body=req.method==='POST'?await payload(req):{};
   const post=()=>{if(req.method!=='POST')throw error('Método no permitido.',405);};
   const cookie=(session=null)=>res.setHeader('Set-Cookie',`${CLOUD_COOKIE}=${session?.access_token||''}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${session?Math.min(session.expires_in||3600,3600):0}`);
   let ctx=await context(cloudToken(req));
   if(path==='state'&&req.method==='GET')return send(res,200,{cloud:true,setup:false,setupAllowed:false,user:ctx?.account||null,needsProfile:!!ctx&&!ctx.account});
   if(path==='me'&&req.method==='GET')return approved(ctx)?send(res,200,{user:ctx.account}):send(res,401,{code:'AUTH_REQUIRED',error:'Sin sesión aprobada.'});
   if(path==='login'){post();const result=await login(body.identifier,body.password);cookie(result.session);return send(res,200,{user:result.ctx?.account||null,session:result.session,needsProfile:!!result.needsProfile});}
   if(path==='request'){post();
    if(!/^[a-z0-9._-]{3,40}$/.test(body.username||'')||!String(body.name||'').trim()||String(body.name).length>80||!/^\S+@\S+\.\S+$/.test(body.email||'')||String(body.password||'').length<8)throw error('Revisá nombre, usuario, correo y contraseña.');
    const r=await publicClient().auth.signUp({email:body.email,password:body.password,options:{emailRedirectTo:expected+'/login.html',data:{requested_username:body.username,requested_name:body.name}}});
    if(r.error)throw error('No se pudo enviar la solicitud. Revisá los datos o intentá más tarde.');
    if(r.data.session){cookie(r.data.session);try{await requestAccount(r.data.session.access_token,body);}catch{return send(res,200,{needsProfile:true,session:r.data.session});}return send(res,201,{pending:true,session:r.data.session});}
    return send(res,202,{pending:true,confirmEmail:true});
   }
   if(path==='request-profile'){post();
    if(!ctx?.identity||ctx.account)throw error('Entrá con tu cuenta antes de completar una solicitud nueva.',403);
    const account=await requestAccount(ctx.token,body);return send(res,201,{pending:account.status==='pending',user:account});
   }
   if(path==='sync'){post();
    ctx=await context(body.access_token);
    if(!ctx)throw error('Sin sesión.',401);
    const completeRequest=body.completeRequest===true;
    if(!ctx.account&&completeRequest){
     const {requested_username:username,requested_name:name}=ctx.identity.user_metadata||{};
     if(username&&name){
      try{await requestAccount(ctx.token,{username,name});}
      catch(e){if(e.code==='MEMBER_PROFILE_REVIEW')throw e;}
      ctx=await context(body.access_token);
     }
    }
    if(!ctx||(ctx.account?ctx.account.sessionValid!==true:!completeRequest))throw error('Sin sesión.',401);
    cookie({access_token:body.access_token,expires_in:3600});
    return send(res,200,{user:ctx.account});
   }
   if(path==='logout'){post();if(ctx)unwrap(await service.auth.admin.signOut(ctx.token,'global'));cookie();return send(res,200,{ok:true});}
   if(!ctx?.account)throw error('Tu sesión terminó.',401,'AUTH_REQUIRED');
   if(path==='change-password'){post();
    const signed=await publicClient().auth.signInWithPassword({email:ctx.identity.email,password:String(body.current||'')});
    if(signed.error||signed.data.user?.id!==ctx.identity.id)throw error('La contraseña actual no es correcta.',401);
    if(String(body.next||'').length<8||body.next===body.current)throw error('Elegí otra contraseña de al menos 8 caracteres.');
    unwrap(await service.auth.admin.updateUserById(ctx.identity.id,{password:body.next}));
    await rpc('vocatus_password_changed',{p_actor:ctx.identity.id});
    // La sesión nueva se compara por created_at; no exige esperar al siguiente segundo.
    const next=await login(ctx.identity.email,body.next);cookie(next.session);return send(res,200,{user:next.ctx.account,session:next.session});
   }
   const actor=requireAdmin(ctx);
   if(path==='users'&&req.method==='GET')return send(res,200,{users:await manage(actor,'list')});
   if(path==='audit'&&req.method==='GET')return send(res,200,{entries:await manage(actor,'audit')});
   if(path==='users'){post();
    if(!/^[a-z0-9._-]{3,40}$/.test(body.username||'')||!/^\S+@\S+\.\S+$/.test(body.email||'')||!String(body.name||'').trim()||!['admin','usuario'].includes(body.role))throw error('Completá usuario, nombre, correo y rol.');
    const password=temporaryPassword();
    const created=unwrap(await service.auth.admin.createUser({email:body.email,password,email_confirm:true}));
    // No elimina automáticamente Auth si falla la DB: queda sin aprobación y sin datos del visor.
    const id=created.user.id;
    await rpc('vocatus_register_managed',{p_actor:actor,p_target:id,p_username:body.username,p_name:body.name});
    await manage(actor,'approve',id);if(body.role==='admin')await manage(actor,'update',id,{role:'admin'});
    await manage(actor,'reset_begin',id);
    return send(res,201,{user:{id,name:body.name,username:body.username},password});
   }
   const match=path.match(/^users\/([0-9a-f-]{36})(?:\/(approve|reject|reset))?$/);
   if(match){post();const [,id,action]=match;
    if(action==='reset'){await manage(actor,'reset_begin',id);const password=temporaryPassword();unwrap(await service.auth.admin.updateUserById(id,{password}));return send(res,200,{user:{id,name:id,username:id},password});}
    return send(res,200,{user:await manage(actor,action||'update',id,body)});
   }
   throw error('Acción no encontrada.',404);
  }catch(e){return send(res,e.status||503,{code:e.code,error:e.status?e.message:'El servicio de cuentas no está disponible.'});}
 }
 return {context,approved,route,async authorize(req,url,body={}){const ctx=await context(cloudToken(req));if(!approved(ctx))throw error('Necesitás una sesión aprobada.',401,'AUTH_REQUIRED');return authorizeAccount(ctx.account,{method:req.method,pathname:url.pathname,body});},
  async audit(actor,action,detail={}){return rpc('vocatus_record_action',{p_actor:actor,p_action:action,p_detail:detail});}};
}

// Exclusivamente el proyecto temporal. No desplegar este coordinador en la base compartida.
// El bundle de pruebas incorpora cloud-access.mjs y sus dependencias desde el visor.
import {createClient} from '@supabase/supabase-js';
import {createCloudAccess} from './cloud-access.mjs';
const TEST_REF='rbiuaucawhmiqvqomqec';
const url=Deno.env.get('SUPABASE_URL')||'';
const key=Deno.env.get('SUPABASE_ANON_KEY')||'';
const secret=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
const publicClient=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
const access=createCloudAccess({config:{url,key,secret}});
Deno.serve(async request=>{
 if(url!==`https://${TEST_REF}.supabase.co`)return new Response('Wrong test project',{status:403});
 try{
  const auth=request.headers.get('authorization')||'';
  if(!auth.startsWith('Bearer '))return new Response('QA_AUTH_REQUIRED',{status:401});
  const token=auth.slice(7),identity=await publicClient.auth.getUser(token);
  if(identity.error||!identity.data.user)return new Response('QA_AUTH_REQUIRED',{status:401});
  const asCaller=createClient(url,key,{auth:{persistSession:false},global:{headers:{Authorization:auth}}});
  const own=await asCaller.rpc('vocatus_account');
  if(own.error||own.data?.role!=='admin'||own.data?.status!=='approved'||!own.data?.active||!own.data?.sessionValid||own.data?.mustChange)return new Response('QA_ADMIN_ONLY',{status:403});
  const input=await request.json();
  if(!/^(state|me|login|request|request-profile|sync|logout|change-password|users(?:\/[0-9a-f-]{36}(?:\/(approve|reject|reset))?)?|audit)$/.test(input.route))return new Response('QA_ROUTE_DENIED',{status:400});
  let result={status:500,data:{error:'No result'}};
  await access.route({
   req:{method:input.method||'POST',headers:{cookie:'vocatus_cloud_access='+(input.token||''),origin:new URL(url).origin,'x-original-host':new URL(url).host,'content-type':'application/json'}},
   res:{setHeader(){}},url:new URL('/api/auth/'+input.route,url),
   payload:async()=>input.body||{},send:(_res,status,data)=>{result={status,data};},
  });
  return Response.json(result,{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'QA function failed'},{status:500});}
});

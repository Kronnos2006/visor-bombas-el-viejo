// Compatible con Edge: no importa módulos Node ni usa claves privilegiadas.
export const cloudPublicPaths=new Set(['/login.html','/acceso.js','/acceso.css','/cloud-session.js','/cloud-photos-config.js','/vendor/supabase.js','/marca/vocatus.png','/favicon.ico']);
export async function cloudPageAccess(request,{url,key,fetcher=fetch}){
 const path=new URL(request.url).pathname;
 if(cloudPublicPaths.has(path)||path.startsWith('/api/auth/'))return null;
 const token=request.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith('vocatus_cloud_access='))?.slice('vocatus_cloud_access='.length);
 const deny=(status,message)=>new Response(message,{status,headers:{'Cache-Control':'no-store'}});
 if(!url||!key)return deny(503,'Falta configurar el servidor de cuentas.');
 if(!token){if(path==='/'||path.endsWith('.html'))return new Response(null,{status:302,headers:{Location:'/login.html?next='+encodeURIComponent(new URL(request.url).pathname+new URL(request.url).search),'Cache-Control':'no-store'}});return deny(401,'Necesitás una sesión aprobada.');}
 try{
  const headers={apikey:key,Authorization:'Bearer '+token};
  const user=await fetcher(url+'/auth/v1/user',{headers,cache:'no-store'});
  if(!user.ok)return deny(401,'Sesión inválida.');
  const identity=await user.json();if(!identity.id||!identity.email_confirmed_at)return deny(401,'Sesión inválida.');
  const response=await fetcher(url+'/rest/v1/rpc/vocatus_account',{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:'{}',cache:'no-store'});
  if(!response.ok)return deny(503,'No se pudo comprobar el permiso.');
  const account=await response.json();
  if(!account||account.id!==identity.id||account.status!=='approved'||account.active!==true||account.sessionValid!==true)return deny(403,'Tu cuenta todavía no tiene acceso aprobado.');
  if(account.mustChange)return new Response(null,{status:302,headers:{Location:'/login.html?cambiar=1','Cache-Control':'no-store'}});
  if(['/usuarios.html','/usuarios.js','/equipo.html','/equipo.js'].includes(path)&&account.role!=='admin')return deny(403,'Solo un administrador puede usar esta parte.');
  return null;
 }catch{return deny(503,'No se pudo comprobar el permiso.');}
}

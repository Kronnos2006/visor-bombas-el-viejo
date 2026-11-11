// Frontera de identidad del servidor. No importa código del navegador ni almacena sesiones locales.
// Los adaptadores deben proporcionar auth.getUser y una lectura protegida de la cuenta actual.
import {delicateAction} from './auth.mjs';

export const CLOUD_ADMIN_PAGES=new Set(['/usuarios.html','/usuarios.js','/equipo.html','/equipo.js','/diseno.html','/diseno-editor.js']);
const denied=(message,status=403,code='ADMIN_ONLY')=>Object.assign(new Error(message),{status,code});

export function accountIdentity(authUser,account){
 if(!authUser?.id||!authUser.email_confirmed_at||!account||account.id!==authUser.id||account.active!==true)return null;
 // Nunca se usan user_metadata/app_metadata, el rol del formulario o un JWT decodificado sin verificar.
 if(!['admin','usuario'].includes(account.role))return null;
 return Object.freeze({id:authUser.id,username:account.username,email:authUser.email,
  name:account.name,role:account.role,active:true,mustChange:account.mustChange===true});
}

export function authorizeAccount(user,{method='GET',pathname,body={}}){
 if(!user)throw denied('Tu sesión terminó. Volvé a entrar.',401,'AUTH_REQUIRED');
 if(user.mustChange)throw denied('Primero tenés que cambiar tu contraseña.',403,'PASSWORD_CHANGE');
 const admin=CLOUD_ADMIN_PAGES.has(pathname)||delicateAction(method,pathname,body);
 if(admin&&user.role!=='admin')throw denied('Este cambio solo lo puede hacer un administrador.');
 return {user,audit:typeof admin==='string'?admin:''};
}

export function createCloudIdentityVerifier({auth,readAccount}){
 if(typeof auth?.getUser!=='function'||typeof readAccount!=='function')throw new TypeError('Falta el proveedor de identidad del servidor.');
 return async token=>{
  if(typeof token!=='string'||!token||token.length>16384)return null;
  // getUser consulta Supabase Auth. getSession o leer los claims no prueba identidad.
  const {data,error}=await auth.getUser(token);
  if(error||!data?.user?.id)return null;
  // Sin caché de roles: una cuenta desactivada o degradada debe verse en la siguiente petición.
  const account=await readAccount({id:data.user.id,token});
  return accountIdentity(data.user,account);
 };
}

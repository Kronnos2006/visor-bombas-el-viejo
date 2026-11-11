// Acceso local del visor: usuarios con contraseña, roles y bitácora.
// Los datos viven fuera del repositorio y de la bóveda (carpeta personal del equipo), para que nunca se suban.
import {randomBytes,scrypt,timingSafeEqual,createHash,randomUUID} from 'node:crypto';
import {mkdir,readFile,writeFile,rename,appendFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const KEYLEN=64,SESSION_MS=12*3600*1000,LOCK_AFTER=5,LOCK_MS=15*60*1000;
export const ROLES=['admin','usuario'];
export const COOKIE='vocatus_acceso';
export const defaultAuthDir=()=>process.env.VISOR_AUTH_DIR||path.join(os.homedir(),'.vocatus-visor');

const fail=(message,status=400,code)=>Object.assign(new Error(message),{status,code});
const derive=(password,salt)=>new Promise((ok,no)=>scrypt(String(password).normalize('NFKC'),salt,KEYLEN,(e,key)=>e?no(e):ok(key)));
async function hashPassword(password){const salt=randomBytes(16);return {salt:salt.toString('hex'),hash:(await derive(password,salt)).toString('hex')};}
async function matches(password,record){return timingSafeEqual(await derive(password,Buffer.from(record.salt,'hex')),Buffer.from(record.hash,'hex'));}
const digest=token=>createHash('sha256').update(token).digest('hex');
const DUMMY={salt:'00'.repeat(16),hash:'00'.repeat(KEYLEN)};
// Sin letras ni números que se confundan al dictarla (0/O, 1/l).
export function temporaryPassword(){const abc='abcdefghjkmnpqrstuvwxyz23456789';return Array.from(randomBytes(10),b=>abc[b%abc.length]).join('');}

function cleanUsername(value){const v=String(value??'').trim().toLowerCase();if(!/^[a-z0-9._-]{3,40}$/.test(v))throw fail('El usuario debe tener de 3 a 40 letras o números, sin espacios.');return v;}
function cleanEmail(value){const v=String(value??'').trim().toLowerCase();if(v&&(v.length>120||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)))throw fail('El correo no es válido.');return v;}
function cleanName(value){const v=String(value??'').replace(/\s+/g,' ').trim().slice(0,80);if(!v)throw fail('Escribí el nombre de la persona.');return v;}
function cleanRole(value){if(!ROLES.includes(value))throw fail('Rol no válido.');return value;}
function checkPassword(password,user={}){const p=String(password??'');if(p.length<8)throw fail('La contraseña debe tener al menos 8 caracteres.');if(p.length>200)throw fail('La contraseña es demasiado larga.');if(p.toLowerCase()===user.username||p.toLowerCase()===user.email)throw fail('La contraseña no puede ser igual al usuario o al correo.');return p;}
const publicUser=u=>({id:u.id,username:u.username,email:u.email,name:u.name,role:u.role,active:u.active,mustChange:!!u.mustChange,createdAt:u.createdAt,lastLogin:u.lastLogin||''});

export function authStore(dir=defaultAuthDir()){
 const file=path.join(dir,'usuarios.json'),log=path.join(dir,'bitacora.jsonl');
 const sessions=new Map(),attempts=new Map();
 let queue=Promise.resolve();
 const serial=work=>{const run=queue.then(work,work);queue=run.catch(()=>{});return run;};
 // Se lee en cada operación: la herramienta de recuperación puede cambiar el archivo con el visor abierto.
 async function read(){try{return JSON.parse(await readFile(file,'utf8'));}catch(e){if(e.code==='ENOENT')return {users:[]};throw e;}}
 async function write(data){await mkdir(dir,{recursive:true,mode:0o700});const tmp=`${file}.${randomUUID()}.tmp`;await writeFile(tmp,JSON.stringify(data,null,1),{mode:0o600});await rename(tmp,file);}
 const clash=(users,{username,email},id)=>{
  if(users.some(u=>u.id!==id&&(u.username===username||(email&&u.email===email)||u.email===username||(email&&u.username===email))))throw fail('Ya existe una cuenta con ese usuario o correo.',409);
 };
 const activeAdmins=users=>users.filter(u=>u.role==='admin'&&u.active);
 async function audit(actor,action,detail=''){await mkdir(dir,{recursive:true,mode:0o700});await appendFile(log,JSON.stringify({at:new Date().toISOString(),actor:actor||'',action,detail:String(detail).slice(0,300)})+'\n',{mode:0o600});}
 function newUser(input){return {id:randomUUID(),username:cleanUsername(input.username),email:cleanEmail(input.email),name:cleanName(input.name),role:cleanRole(input.role),active:true,createdAt:new Date().toISOString()};}
 function open(user){const token=randomBytes(32).toString('base64url');sessions.set(digest(token),{id:user.id,version:user.hash,expires:Date.now()+SESSION_MS});return token;}
 return {
  audit,
  async hasUsers(){return (await read()).users.length>0;},
  setup(input){return serial(async()=>{
   const data=await read();if(data.users.length)throw fail('El administrador ya fue creado.',409);
   const user=newUser({...input,role:'admin'});checkPassword(input.password,user);Object.assign(user,await hashPassword(input.password));
   data.users.push(user);await write(data);await audit(user.username,'Creó el primer administrador');
   return {token:open(user),user:publicUser(user)};
  });},
  async login(identifier,password){
   const id=String(identifier??'').trim().toLowerCase().slice(0,120),now=Date.now(),seen=attempts.get(id);
   if(seen?.until>now)throw fail('Demasiados intentos. Esperá unos minutos y volvé a probar.',429,'LOCKED');
   const user=(await read()).users.find(u=>u.username===id||(u.email&&u.email===id));
   const valid=await matches(String(password??''),user||DUMMY);
   if(!user||!valid||!user.active){
    const count=(seen?.until&&seen.until<=now?0:seen?.count||0)+1;attempts.set(id,{count,until:count>=LOCK_AFTER?now+LOCK_MS:0});
    if(count>=LOCK_AFTER)await audit(id,'Cuenta bloqueada por intentos fallidos');
    throw fail('Usuario o contraseña incorrectos.',401);
   }
   attempts.delete(id);
   return serial(async()=>{const data=await read(),current=data.users.find(u=>u.id===user.id);current.lastLogin=new Date().toISOString();await write(data);await audit(current.username,'Entró al visor');return {token:open(current),user:publicUser(current)};});
  },
  async session(token){
   if(!token)return null;const key=digest(token),s=sessions.get(key);if(!s)return null;
   if(s.expires<Date.now()){sessions.delete(key);return null;}
   const user=(await read()).users.find(u=>u.id===s.id);
   if(!user||!user.active||user.hash!==s.version){sessions.delete(key);return null;}
   return publicUser(user);
  },
  logout(token){if(token)sessions.delete(digest(token));},
  changePassword(id,current,next){return serial(async()=>{
   const data=await read(),user=data.users.find(u=>u.id===id);if(!user)throw fail('La cuenta ya no existe.',404);
   if(!await matches(String(current??''),user))throw fail('La contraseña actual no es correcta.',401);
   checkPassword(next,user);if(String(next)===String(current))throw fail('La contraseña nueva debe ser distinta.');
   Object.assign(user,await hashPassword(next));delete user.mustChange;await write(data);await audit(user.username,'Cambió su contraseña');
   return {token:open(user),user:publicUser(user)};
  });},
  async list(){return (await read()).users.map(publicUser);},
  create(actor,input){return serial(async()=>{
   const data=await read(),user=newUser(input);clash(data.users,user);
   const password=temporaryPassword();Object.assign(user,await hashPassword(password),{mustChange:true});
   data.users.push(user);await write(data);await audit(actor,'Creó una cuenta',`${user.username} (${user.role})`);
   return {user:publicUser(user),password};
  });},
  update(actor,id,input){return serial(async()=>{
   const data=await read(),user=data.users.find(u=>u.id===id);if(!user)throw fail('La cuenta ya no existe.',404);
   const next={...user,name:input.name===undefined?user.name:cleanName(input.name),email:input.email===undefined?user.email:cleanEmail(input.email),role:input.role===undefined?user.role:cleanRole(input.role),active:input.active===undefined?user.active:!!input.active};
   clash(data.users,next,id);
   const others=activeAdmins(data.users.filter(u=>u.id!==id));
   if(!(next.role==='admin'&&next.active)&&user.role==='admin'&&user.active&&!others.length)throw fail('Tiene que quedar al menos un administrador activo.',409);
   Object.assign(user,next);await write(data);await audit(actor,'Modificó una cuenta',`${user.username}: ${user.role}, ${user.active?'activa':'desactivada'}`);
   return publicUser(user);
  });},
  resetPassword(actor,id){return serial(async()=>{
   const data=await read(),user=data.users.find(u=>u.id===id);if(!user)throw fail('La cuenta ya no existe.',404);
   const password=temporaryPassword();Object.assign(user,await hashPassword(password),{mustChange:true,active:true});
   await write(data);attempts.delete(user.username);if(user.email)attempts.delete(user.email);await audit(actor,'Restableció una contraseña',user.username);
   return {user:publicUser(user),password};
  });},
  async auditList(limit=200){try{return (await readFile(log,'utf8')).trim().split('\n').slice(-limit).reverse().map(line=>JSON.parse(line));}catch(e){if(e.code==='ENOENT')return [];throw e;}},
 };
}

// Acciones delicadas: solo administradores. Devuelve la descripción para la bitácora o '' si es trabajo normal.
export function delicateAction(method,pathname,body={}){
 if(pathname==='/api/config')return 'Cambió la configuración de Gemini';
 if(pathname==='/api/temperature-range')return `Cambió el rango de temperatura de ${body.tag}`;
 if(pathname==='/api/maintenance'&&method==='DELETE')return `Eliminó un informe de ${body.tag}`;
 if(pathname==='/api/equipment'&&['move','swap','replace'].includes(body.action))return `${{move:'Movió',swap:'Intercambió',replace:'Reemplazó'}[body.action]} la bomba ${body.tag}${body.other?' con '+body.other:''}`;
 if(pathname==='/api/survey'&&body.clearFields&&Object.keys(body.clearFields).length)return `Quitó datos de la ficha ${body.tag}`;
 return '';
}

const PUBLIC_PATHS=new Set(['/login.html','/acceso.js','/acceso.css','/marca/vocatus.png','/favicon.ico']);
const ADMIN_PAGES=new Set(['/usuarios.html','/usuarios.js','/equipo.html','/equipo.js','/diseno.html','/diseno-editor.js']);
const readCookie=(req,name)=>{for(const part of String(req.headers.cookie||'').split(';')){const i=part.indexOf('=');if(i>0&&part.slice(0,i).trim()===name)return part.slice(i+1).trim();}return '';};
const isLoopback=req=>['127.0.0.1','::1','::ffff:127.0.0.1'].includes(req.socket?.remoteAddress);
const isPage=pathname=>pathname==='/'||pathname.endsWith('.html');
function setCookie(req,res,token,maxAge){
 const secure=req.headers['x-forwarded-proto']==='https'?'; Secure':'';
 res.setHeader('Set-Cookie',`${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure}`);
}
function redirect(res,location){res.writeHead(302,{Location:location,'Cache-Control':'no-store'});res.end();}

// Atiende /api/auth/* y controla todo lo demás. Devuelve {done:true} si ya respondió, o {user}.
export async function authGate({store,req,res,url,send,payload,isAllowedOrigin}){
 const pathname=url.pathname,token=readCookie(req,COOKIE),user=await store.session(token);
 if(pathname.startsWith('/api/auth/')){
  await authApi({store,req,res,url,send,payload,isAllowedOrigin,token,user});
  return {done:true};
 }
 if(PUBLIC_PATHS.has(pathname))return {user};
 if(!user){
  if(isPage(pathname)){redirect(res,'/login.html?next='+encodeURIComponent(pathname+url.search));return {done:true};}
  send(res,401,{code:'AUTH_REQUIRED',error:'Tu sesión terminó. Volvé a entrar.'});return {done:true};
 }
 if(user.mustChange){
  if(isPage(pathname)){redirect(res,'/login.html?cambiar=1');return {done:true};}
  if(pathname.startsWith('/api/')){send(res,403,{code:'PASSWORD_CHANGE',error:'Primero tenés que cambiar tu contraseña.'});return {done:true};}
 }
 if(ADMIN_PAGES.has(pathname)&&user.role!=='admin'){
  if(isPage(pathname))redirect(res,'/login.html?sinpermiso=1');else send(res,403,{error:'Solo un administrador puede usar esta parte.'});
  return {done:true};
 }
 return {user};
}

async function authApi({store,req,res,url,send,payload,isAllowedOrigin,token,user}){
 const route=url.pathname.slice('/api/auth/'.length);
 try{
  if(req.method==='GET'&&route==='state'){
   const setup=!await store.hasUsers();
   return send(res,200,{setup,setupAllowed:setup&&isLoopback(req),user});
  }
  if(req.method==='GET'&&route==='me')return user?send(res,200,{user}):send(res,401,{code:'AUTH_REQUIRED',error:'Sin sesión.'});
  if(req.method!=='POST'&&!(req.method==='GET'&&['users','audit'].includes(route)))return send(res,405,{error:'Método no permitido.'});
  if(req.method==='POST'){
   if(!isAllowedOrigin(req.headers.origin))return send(res,403,{error:'Origen no permitido.'});
   if(!String(req.headers['content-type']||'').startsWith('application/json'))return send(res,415,{error:'Formato no permitido.'});
  }
  const body=req.method==='POST'?await payload(req):{};
  const opened=(result,status=200)=>{setCookie(req,res,result.token,SESSION_MS/1000);return send(res,status,{user:result.user});};
  if(route==='setup'){
   if(!isLoopback(req))return send(res,403,{error:'El primer administrador solo se crea desde la computadora donde corre el visor.'});
   return opened(await store.setup(body),201);
  }
  if(route==='login')return opened(await store.login(body.identifier,body.password));
  if(route==='logout'){if(user)await store.audit(user.username,'Salió del visor');store.logout(token);setCookie(req,res,'',0);return send(res,200,{ok:true});}
  if(!user)return send(res,401,{code:'AUTH_REQUIRED',error:'Tu sesión terminó. Volvé a entrar.'});
  if(route==='change-password'){const changed=await store.changePassword(user.id,body.current,body.next);store.logout(token);return opened(changed);}
  if(user.role!=='admin')return send(res,403,{error:'Solo un administrador puede usar esta parte.'});
  if(user.mustChange)return send(res,403,{code:'PASSWORD_CHANGE',error:'Primero tenés que cambiar tu contraseña.'});
  if(route==='users'&&req.method==='GET')return send(res,200,{users:await store.list()});
  if(route==='users')return send(res,201,await store.create(user.username,body));
  if(route==='audit')return send(res,200,{entries:await store.auditList()});
  const match=route.match(/^users\/([0-9a-f-]{36})(\/reset)?$/);
  if(match&&req.method==='POST'){
   if(match[2])return send(res,200,await store.resetPassword(user.username,match[1]));
   return send(res,200,{user:await store.update(user.username,match[1],body)});
  }
  return send(res,404,{error:'Acción no encontrada.'});
 }catch(e){return send(res,e.status||400,{code:e.code,error:e.message});}
}

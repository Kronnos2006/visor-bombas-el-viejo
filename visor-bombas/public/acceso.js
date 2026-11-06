// Pantalla de entrada: entrar, crear el primer administrador y cambiar contraseña.
const $=id=>document.getElementById(id),params=new URLSearchParams(location.search);
const leer=k=>{try{return localStorage.getItem(k);}catch{return null;}},guardar=(k,v)=>{try{v===null?localStorage.removeItem(k):localStorage.setItem(k,v);}catch{}};
const SIN_CONEXION=document.documentElement.dataset.cloudAccounts==='1'?'No se pudo conectar. Revisá tu internet y probá de nuevo.':'No se pudo conectar con el visor. Revisá que su ventana negra siga abierta.';
const destino=()=>{const n=params.get('next')||'/';return n.startsWith('/')&&!n.startsWith('//')&&!n.startsWith('/\\')?n:'/';};

// Tema
const pintarTema=()=>{const claro=document.body.classList.contains('claro');$('tema').firstElementChild.textContent=claro?'🌙':'☀️';$('tema').setAttribute('aria-pressed',claro);};
if(leer('vocatus-tema')==='claro')document.body.classList.add('claro');
pintarTema();
$('tema').onclick=()=>{document.body.classList.toggle('claro');guardar('vocatus-tema',document.body.classList.contains('claro')?'claro':'oscuro');pintarTema();};

const post=async(path,body)=>{
 let r;try{r=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});}catch{throw new Error(SIN_CONEXION);}
 const data=await r.json().catch(()=>({}));if(data.session){const {acceptCloudSession}=await import('./cloud-session.js');await acceptCloudSession(data.session);}if(!r.ok)throw new Error(data.error||'No se pudo completar. Probá de nuevo.');return data;
};
function aviso(text){const a=$('aviso');a.textContent=text||'';a.hidden=!text;if(text){a.classList.remove('sacudir');void a.offsetWidth;a.classList.add('sacudir');}}
function mostrar(id,titulo,ayuda){
 for(const f of ['f-login','f-setup','f-request','f-cambiar','sin-permiso'])$(f).hidden=f!==id;
 $('titulo').textContent=titulo;$('ayuda').textContent=ayuda;document.title=titulo+' · Vocatus';
 const inputs=[...$(id).querySelectorAll('.campo input')];(inputs.find(i=>!i.value)||inputs[0])?.focus();
}
function enviar(id,accion,textoEspera){
 const form=$(id);
 form.onsubmit=async e=>{
  e.preventDefault();aviso('');
  const vacio=[...form.querySelectorAll('input[required]')].find(i=>!i.value.trim());
  if(vacio){aviso(`Falta: ${vacio.parentElement.querySelector('span').textContent}.`);vacio.focus();return;}
  const boton=form.querySelector('.principal'),texto=boton.querySelector('span'),original=texto.textContent;
  boton.disabled=true;boton.classList.add('cargando');texto.textContent=textoEspera;
  try{await accion(Object.fromEntries(new FormData(form)));boton.disabled=false;boton.classList.remove('cargando');texto.textContent=original;}
  catch(err){aviso(err.message);boton.disabled=false;boton.classList.remove('cargando');texto.textContent=original;form.querySelector('input[type=password]')?.select();}
 };
 form.addEventListener('input',()=>{if(!$('aviso').hidden)aviso('');});
}

// Ver contraseña y aviso de mayúsculas
document.querySelectorAll('.ver').forEach(b=>b.onclick=()=>{
 const i=b.parentElement.querySelector('input'),ver=i.type==='password';
 i.type=ver?'text':'password';b.setAttribute('aria-pressed',ver);b.setAttribute('aria-label',ver?'Ocultar contraseña':'Mostrar contraseña');i.focus();
});
document.querySelectorAll('input[type=password]').forEach(i=>{
 const nota=i.form.querySelector('.mayus');
 const ver=e=>{if(e.getModifierState)nota.hidden=!e.getModifierState('CapsLock');};
 i.addEventListener('keydown',ver);i.addEventListener('keyup',ver);i.addEventListener('blur',()=>nota.hidden=true);
});
// Solo orienta; la regla obligatoria (8 caracteres) la aplica el servidor.
document.querySelectorAll('[data-fuerza]').forEach(i=>{
 const box=i.form.querySelector('.fuerza'),msg=box.querySelector('small');
 i.addEventListener('input',()=>{
  const v=i.value,tipos=[/[a-z]/,/[A-Z]/,/\d/,/[^a-zA-Z0-9]/].filter(r=>r.test(v)).length;
  box.hidden=!v;
  const nivel=v.length<8?1:(v.length>=12&&tipos>=2)||tipos>=3?3:2;
  box.dataset.nivel=nivel;
  msg.textContent=v.length<8?`Faltan ${8-v.length} caracteres.`:nivel===3?'Contraseña fuerte.':'Sirve. Más larga es más segura.';
 });
});

let completingProfile=false;
function mostrarSolicitud(existing=false){
 completingProfile=existing;
 const form=$('f-request');
 for(const name of ['email','password']){const input=form.elements.namedItem(name);input.required=!existing;input.closest('label').hidden=existing;}
 mostrar('f-request',existing?'Completar solicitud':'Solicitar acceso',existing?'Elegí tu usuario y nombre. Tu cuenta ya existe; no hace falta crear otra.':'Creá tu cuenta y confirmá el correo. Un administrador revisará tu solicitud.');
}
// Recordar usuario: solo el nombre, nunca la contraseña.
const recordado=leer('vocatus-usuario');
if(recordado){$('f-login').identifier.value=recordado;$('recordar').checked=true;}
enviar('f-login',async d=>{
 const result=await post('/api/auth/login',d);
 if(result.needsProfile){mostrarSolicitud(true);return;}
 const {user}=result;
 guardar('vocatus-usuario',$('recordar').checked?d.identifier.trim():null);
 if(user.status&&user.status!=='approved'){mostrar('f-login',user.status==='pending'?'Solicitud pendiente':'Solicitud rechazada','Un administrador debe aprobar tu acceso antes de entrar.');return;}
 if(user.active===false){aviso('Tu cuenta está desactivada. Consultá a un administrador.');return;}
 location.replace(user.mustChange?'/login.html?cambiar=1&next='+encodeURIComponent(destino()):destino());
},'Entrando…');
enviar('f-setup',async d=>{await post('/api/auth/setup',d);location.replace('/');},'Creando…');
enviar('f-cambiar',async d=>{await post('/api/auth/change-password',d);location.replace(destino());},'Guardando…');

$('request-access').onclick=()=>mostrarSolicitud(false);
$('request-back').onclick=()=>mostrar('f-login','Entrar','Escribí tu usuario o correo y tu contraseña.');
enviar('f-request',async d=>{
 d.username=d.username.trim().toLowerCase();d.name=d.name.trim();
 const result=await post(completingProfile?'/api/auth/request-profile':'/api/auth/request',completingProfile?{username:d.username,name:d.name}:d);
 if(result.needsProfile){mostrarSolicitud(true);aviso('Completá tu solicitud con un nombre de usuario disponible.');return;}
 if(result.user?.status==='approved'){location.replace(destino());return;}
 mostrar('f-login','Solicitud enviada',result.confirmEmail?'Abrí el enlace de confirmación que te enviamos. Si volvés a la pantalla de entrada, usá tu correo y contraseña.':'Tu solicitud está pendiente de aprobación.');
},'Enviando…');
let state=null;
try{state=await (await fetch('/api/auth/state')).json();}catch{mostrar('sin-permiso','Sin conexión',SIN_CONEXION);$('sin-permiso').hidden=true;}
if(state){
 if(state.cloud){
  try{const {startCloudAccount}=await import('./cloud-session.js');if(await startCloudAccount({completeRequest:true}))state=await(await fetch('/api/auth/state')).json();}catch{}
  $('request-access').hidden=false;
 }
 if(state.cloud&&state.user&&(state.user.active===false||state.user.sessionValid===false)){
  mostrar('f-login','Entrar',state.user.active===false?'Tu cuenta está desactivada. Consultá a un administrador.':'Tu sesión terminó. Volvé a entrar.');
 }else if(state.needsProfile){
  mostrarSolicitud(true);
 }else if(state.user?.status&&state.user.status!=='approved'){
  mostrar('f-login',state.user.status==='pending'?'Solicitud pendiente':'Solicitud rechazada','Un administrador debe aprobar tu acceso.');
 }else
 if(state.setup){
  if(state.setupAllowed)mostrar('f-setup','Crear administrador','Es la primera vez. Esta cuenta controlará el visor.');
  else{mostrar('sin-permiso','Falta el administrador','Abrí el visor en la computadora donde está instalado para crear la primera cuenta.');$('sin-permiso').hidden=true;}
 }else if(!state.user)mostrar('f-login','Entrar','Escribí tu usuario o correo y tu contraseña.');
 else if(params.has('sinpermiso'))mostrar('sin-permiso','Sin permiso','Esta parte solo la puede usar un administrador.');
 else if(params.has('cambiar')||state.user.mustChange)mostrar('f-cambiar',state.user.mustChange?'Creá tu contraseña':'Cambiar contraseña',state.user.mustChange?'Por seguridad, cambiá la contraseña temporal por una tuya.':'Elegí una contraseña nueva.');
 else location.replace(destino());
}

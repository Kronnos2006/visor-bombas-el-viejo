// Administración de cuentas. El servidor vuelve a comprobar cada permiso.
const $=id=>document.getElementById(id);
try{if(localStorage.getItem('vocatus-tema')==='claro')document.body.classList.add('claro');}catch{}
let yo=null;
const api=async(path,body)=>{const r=await fetch(path,body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:undefined);const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.error||'No se pudo completar.');return data;};
const aviso=text=>{$('aviso').textContent=text||'';$('aviso').hidden=!text;if(text)$('aviso').scrollIntoView({block:'center'});};
function mostrarClave(user,password){const box=$('nueva-clave');box.replaceChildren();const t=document.createElement('div');t.textContent=`Contraseña temporal de ${user.name} (usuario: ${user.username}). Anotala ahora: no se vuelve a mostrar. Al entrar, tendrá que crear la suya.`;const c=document.createElement('code');c.textContent=password;box.append(t,c);box.hidden=false;box.scrollIntoView({block:'center'});}
const accion=async work=>{aviso('');try{await work();await pintar();}catch(e){aviso(e.message);await pintar().catch(()=>{});}};
const el=(tag,props={},...kids)=>{const n=Object.assign(document.createElement(tag),props);n.append(...kids);return n;};
function fila(u){
 const titulo=el('b',{textContent:u.name});
 const info=el('div',{},titulo);
 if(u.id===yo.id)info.append(el('span',{className:'etiqueta',textContent:'Vos'}));
 if(!u.active)info.append(el('span',{className:'etiqueta off',textContent:'Desactivada'}));
 if(u.mustChange)info.append(el('span',{className:'etiqueta',textContent:'Contraseña temporal'}));
 info.append(el('small',{textContent:[u.username,u.email].filter(Boolean).join(' · ')}),el('small',{textContent:u.lastLogin?'Última entrada: '+new Date(u.lastLogin).toLocaleString('es-CR'):'Todavía no ha entrado'}));
 const rol=el('select',{ariaLabel:`Permiso de ${u.name}`});
 rol.append(el('option',{value:'usuario',textContent:'Usuario'}),el('option',{value:'admin',textContent:'Administrador'}));rol.value=u.role;
 rol.onchange=()=>accion(()=>api(`/api/auth/users/${u.id}`,{role:rol.value}));
 const clave=el('button',{type:'button',textContent:'Nueva contraseña'});
 clave.onclick=()=>accion(async()=>{const r=await api(`/api/auth/users/${u.id}/reset`,{});mostrarClave(r.user,r.password);});
 const activa=el('button',{type:'button',textContent:u.active?'Desactivar':'Activar'});
 activa.onclick=()=>accion(()=>api(`/api/auth/users/${u.id}`,{active:!u.active}));
 return el('div',{className:'cuenta'},info,el('div',{className:'cuenta-acciones'},rol,clave,activa));
}
async function pintar(){
 const {users}=await api('/api/auth/users');$('lista').replaceChildren(...users.map(fila));
 const {entries}=await api('/api/auth/audit');
 $('bitacora').replaceChildren(...(entries.length?entries:[]).map(e=>el('li',{},el('time',{textContent:new Date(e.at).toLocaleString('es-CR')}),`${e.actor}: ${e.action}${e.detail?' · '+e.detail:''}`)));
}
$('crear').onsubmit=e=>{e.preventDefault();const form=e.target;accion(async()=>{const r=await api('/api/auth/users',Object.fromEntries(new FormData(form)));form.reset();mostrarClave(r.user,r.password);});};
yo=(await api('/api/auth/me')).user;await pintar();

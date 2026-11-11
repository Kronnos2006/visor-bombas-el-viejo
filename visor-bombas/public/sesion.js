// Solo se carga en el visor local con cuentas: muestra quién entró y oculta lo que su rol no puede usar.
(()=>{
 const nativo=window.fetch.bind(window);
 const irAEntrar=()=>location.assign('/login.html?next='+encodeURIComponent(location.pathname+location.search));
 window.fetch=async(...args)=>{const r=await nativo(...args);if(r.status===401&&r.headers.get('content-type')?.includes('json')){const d=await r.clone().json().catch(()=>({}));if(d.code==='AUTH_REQUIRED')irAEntrar();}return r;};
 const pintar=user=>{
  document.documentElement.dataset.rol=user.role;
  const box=document.createElement('details');box.className='sesion';
  const resumen=document.createElement('summary');resumen.textContent='👤 '+user.name.split(' ')[0];resumen.title='Tu cuenta';box.append(resumen);
  const menu=document.createElement('div');menu.className='sesion-menu';
  const quien=document.createElement('p');quien.textContent=`${user.name} · ${user.role==='admin'?'Administrador':'Usuario'}`;menu.append(quien);
  if(user.role==='admin'){const a=document.createElement('a');a.href='/usuarios.html';a.textContent='Usuarios';const d=document.createElement('a');d.href='/diseno.html';d.textContent='Editar diseño';menu.append(a,d);}
  const clave=document.createElement('a');clave.href='/login.html?cambiar=1&next='+encodeURIComponent(location.pathname+location.search);clave.textContent='Cambiar contraseña';menu.append(clave);
  const salir=document.createElement('button');salir.type='button';salir.textContent='Salir';
  salir.onclick=async()=>{
   salir.disabled=true;
   try{
    const state=await(await nativo('/api/auth/state')).json();
    const response=await nativo('/api/auth/logout',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
    if(!response.ok)throw Error('No se pudo cerrar la sesión. Volvé a intentar.');
    if(state.cloud){const {sharedAccountClient}=await import('./cloud-session.js');await(await sharedAccountClient()).auth.signOut({scope:'local'});}
    location.assign('/login.html');
   }catch(e){salir.disabled=false;salir.textContent=e.message;}
  };
  menu.append(salir);box.append(menu);
  const tema=document.getElementById('tema-toggle'),destino=document.querySelector('header');
  if(tema?.parentElement)tema.parentElement.insertBefore(box,tema);else if(destino)destino.append(box);else{box.classList.add('sesion-flotante');document.body.append(box);}
  document.addEventListener('click',e=>{if(!box.contains(e.target))box.open=false;});
 };
 const iniciar=async()=>{try{const state=await(await nativo('/api/auth/state')).json();if(state.cloud){const {startCloudAccount}=await import('./cloud-session.js');await startCloudAccount();}}catch{}const r=await nativo('/api/auth/me');if(r.ok)pintar((await r.json()).user);};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciar);else iniciar();
})();

// Recuperación: si se olvida la contraseña de administrador, genera una temporal.
// Solo funciona desde la computadora donde están guardadas las cuentas.
import {authStore} from './auth.mjs';
const store=authStore(),users=await store.list(),wanted=(process.argv[2]||'').toLowerCase();
const admins=users.filter(u=>u.role==='admin');
const target=wanted?users.find(u=>u.username===wanted||u.email===wanted):admins[0];
if(!target){console.error(users.length?'No se encontró esa cuenta.':'Todavía no hay cuentas: abrí el visor para crear el administrador.');process.exit(1);}
const {password}=await store.resetPassword('recuperación local',target.id);
if(target.role!=='admin')await store.update('recuperación local',target.id,{role:'admin'});
console.log(`Cuenta: ${target.username}\nContraseña temporal: ${password}\nAl entrar, el visor te pedirá crear una nueva.`);

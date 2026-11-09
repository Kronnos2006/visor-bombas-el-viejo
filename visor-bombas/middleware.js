// Vercel Routing Middleware: pide contraseña antes de servir cualquier página, foto o API.
// Exige VISOR_PASSWORD o VOCATUS_CLOUD_ACCOUNTS=1; sin ninguna de las dos, bloquea todo.
import { passwordOk } from './password.mjs';
import {cloudPageAccess} from './cloud-edge-access.js';
import {assertAccountPreviewScope} from './cloud-preview-config.js';

export const config = { matcher: '/:path*' };

export default async function middleware(request) {
 // Falla cerrada: en Vercel, sin contraseña ni cuentas configuradas, no se sirve nada.
 if (!process.env.VISOR_PASSWORD && process.env.VOCATUS_CLOUD_ACCOUNTS !== '1')
  return new Response('Visor sin configuración de acceso. Avisá al administrador.', {status:503,headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'}});
 if (passwordOk(request.headers.get('authorization'), process.env.VISOR_PASSWORD)) {
  if(process.env.VOCATUS_CLOUD_ACCOUNTS!=='1')return;
  try{assertAccountPreviewScope(process.env);}catch{return new Response('Cuentas nuevas fuera de la rama de Preview autorizada.',{status:503});}
  return (await cloudPageAccess(request,{url:process.env.SUPABASE_URL,key:process.env.SUPABASE_PUBLISHABLE_KEY}))||undefined;
 }
 return new Response('Acceso restringido al visor de bombas.', {
  status: 401,
  headers: { 'WWW-Authenticate': 'Basic realm="Visor Vocatus", charset="UTF-8"', 'Content-Type': 'text/plain; charset=utf-8' },
 });
}

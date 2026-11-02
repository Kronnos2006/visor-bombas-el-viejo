// Vercel Routing Middleware: pide contraseña antes de servir cualquier página, foto o API.
// Se activa solo si la variable de entorno VISOR_PASSWORD existe en el proyecto de Vercel.
import { passwordOk } from './password.mjs';
import {cloudPageAccess} from './cloud-edge-access.js';

export const config = { matcher: '/:path*' };

export default async function middleware(request) {
 if (passwordOk(request.headers.get('authorization'), process.env.VISOR_PASSWORD)) {
  if(process.env.VOCATUS_CLOUD_ACCOUNTS!=='1')return;
  if(process.env.VERCEL_ENV!=='preview')return new Response('Cuentas nuevas solo disponibles en Preview.',{status:503});
  return (await cloudPageAccess(request,{url:process.env.SUPABASE_URL,key:process.env.SUPABASE_PUBLISHABLE_KEY}))||undefined;
 }
 return new Response('Acceso restringido al visor de bombas.', {
  status: 401,
  headers: { 'WWW-Authenticate': 'Basic realm="Visor Vocatus", charset="UTF-8"', 'Content-Type': 'text/plain; charset=utf-8' },
 });
}

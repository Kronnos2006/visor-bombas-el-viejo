// Vercel Routing Middleware: pide contraseña antes de servir cualquier página, foto o API.
// Se activa solo si la variable de entorno VISOR_PASSWORD existe en el proyecto de Vercel.
import { passwordOk } from './password.mjs';

export const config = { matcher: '/:path*' };

export default function middleware(request) {
 if (passwordOk(request.headers.get('authorization'), process.env.VISOR_PASSWORD)) return;
 return new Response('Acceso restringido al visor de bombas.', {
  status: 401,
  headers: { 'WWW-Authenticate': 'Basic realm="Visor Vocatus", charset="UTF-8"', 'Content-Type': 'text/plain; charset=utf-8' },
 });
}

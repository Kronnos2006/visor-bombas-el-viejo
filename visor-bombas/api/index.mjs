// Adaptador para Vercel: reutiliza el handler de server.mjs en modo DEMO (solo lectura).
process.env.VOCATUS_DEMO = '1';
const { handler } = await import('../server.mjs');
export default function (req, res) {
  // server.mjs solo acepta Host local (protección anti DNS-rebinding de la versión de escritorio).
  // En Vercel el dominio lo valida la plataforma, así que se normaliza el Host aquí.
  req.headers.host = '127.0.0.1:8766';
  return handler(req, res);
}

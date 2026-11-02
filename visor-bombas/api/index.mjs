// Adaptador para Vercel: reutiliza el handler de server.mjs en modo DEMO (solo lectura).
process.env.VOCATUS_DEMO = '1';
const { handler,useCloudAccess } = await import('../server.mjs');
if(process.env.VOCATUS_CLOUD_ACCOUNTS==='1'){
 if(process.env.VERCEL_ENV!=='preview')throw Error('Cuentas nuevas solo permitidas en Preview.');
 const {createCloudAccess}=await import('../cloud-access.mjs');useCloudAccess(createCloudAccess());
}
export default function (req, res) {
  // server.mjs solo acepta Host local (protección anti DNS-rebinding de la versión de escritorio).
  // En Vercel el dominio lo valida la plataforma, así que se normaliza el Host aquí.
  req.headers['x-original-host'] = req.headers['x-forwarded-host'] || req.headers.host || '';
  req.headers.host = '127.0.0.1:8766';
  return handler(req, res);
}

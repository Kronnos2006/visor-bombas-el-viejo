// Guardia adicional. No sustituye limitar la variable secreta en Vercel.
export const ACCOUNT_PREVIEW_BRANCH='codex/cuentas-vercel';
export function assertAccountPreviewScope(env){
 if(env.VOCATUS_CLOUD_ACCOUNTS!=='1')return false;
 const preview=env.VERCEL_ENV==='preview'&&env.VERCEL_GIT_COMMIT_REF===ACCOUNT_PREVIEW_BRANCH;
 const production=env.VERCEL_ENV==='production'&&env.VERCEL_GIT_COMMIT_REF==='main';
 if(!preview&&!production)
  throw Error('Las cuentas solo se habilitan en producción desde main o en Preview de la rama '+ACCOUNT_PREVIEW_BRANCH+'.');
 return true;
}

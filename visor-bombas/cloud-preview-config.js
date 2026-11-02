// Guardia adicional. No sustituye limitar la variable secreta en Vercel.
export const ACCOUNT_PREVIEW_BRANCH='codex/cuentas-vercel';
export function assertAccountPreviewScope(env){
 if(env.VOCATUS_CLOUD_ACCOUNTS!=='1')return false;
 if(env.VERCEL_ENV!=='preview'||env.VERCEL_GIT_COMMIT_REF!==ACCOUNT_PREVIEW_BRANCH)
  throw Error('Las cuentas nuevas solo se habilitan en Preview de la rama '+ACCOUNT_PREVIEW_BRANCH+'.');
 return true;
}

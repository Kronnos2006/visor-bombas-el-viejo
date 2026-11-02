// Solo el build de Preview altera los HTML generados; las fuentes locales mantienen su acceso.
import {readdir,readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=new URL('../public/',import.meta.url);
if(process.env.VOCATUS_CLOUD_ACCOUNTS==='1'){
 if(process.env.VERCEL_ENV!=='preview')throw Error('Las cuentas nuevas solo se habilitan en Preview.');
 if(!process.env.SUPABASE_URL||!process.env.SUPABASE_PUBLISHABLE_KEY||!process.env.SUPABASE_SECRET_KEY)throw Error('Faltan variables de servidor para Preview.');
 for(const name of await readdir(root)){
  if(!name.endsWith('.html'))continue;
  const path=new URL(name,root);let html=await readFile(path,'utf8');if(!html.includes('data-cloud-accounts="1"'))html=html.replace('<html ', '<html data-cloud-accounts="1" ');if(name==='login.html'){await writeFile(path,html);continue;}
  if(!html.includes('src="/sesion.js"'))html=html.replace('</head>','<link rel="stylesheet" href="/sesion.css"><script src="/sesion.js"></script></head>');await writeFile(path,html);
 }
 console.log('Pantallas de cuentas preparadas para Preview:',fileURLToPath(root));
}

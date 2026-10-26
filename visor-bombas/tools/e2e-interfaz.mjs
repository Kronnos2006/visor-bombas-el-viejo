import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {checkInterface} from './e2e-interfaz-checks.mjs';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),net=require('node:net');
const repo=fileURLToPath(new URL('../..',import.meta.url)),out=process.env.UI_SCREENSHOTS_DIR||path.join(require('node:os').tmpdir(),'vocatus-interfaz');fs.mkdirSync(out,{recursive:true});
async function freePort(){return new Promise(ok=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const port=s.address().port;s.close(()=>ok(port));});});}
(async()=>{
 const port=await freePort(),env={...process.env,PORT:String(port),VOCATUS_DEMO:'1'};delete env.GEMINI_API_KEY;delete env.OBSIDIAN_VAULT;
 const srv=cp.spawn(process.execPath,[repo+'/visor-bombas/server.mjs'],{env,stdio:['ignore','pipe','pipe'],windowsHide:true});let browser;
 try{
  const base='http://127.0.0.1:'+port;for(let i=0;i<60;i++){try{if((await fetch(base+'/api/bootstrap')).ok)break;}catch{}await new Promise(r=>setTimeout(r,250));}
  browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{}),args:['--enable-unsafe-swiftshader']});
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  await context.addInitScript(()=>{sessionStorage.setItem('vocatus-portada','1');});
  await context.route('https://fonts.googleapis.com/**',r=>r.abort());
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/?medir',{waitUntil:'networkidle',timeout:90000});
  await page.waitForFunction(()=>document.querySelectorAll('#pump-list [data-tag]').length>0);
  const tag=await page.locator('#pump-list [data-tag]').first().getAttribute('data-tag');
  await page.locator('#search').fill(tag[0]+'-'+tag.slice(1));
  if(!await page.locator(`#pump-list [data-tag="${tag}"]`).count())throw Error('Búsqueda con guion falló');
  await page.locator('#clear-filters').click();
  await page.locator('#vista-toggle').click();
  const complete=await page.locator('body').evaluate(b=>getComputedStyle(b).getPropertyValue('--accent').trim());
  await page.locator('#vista-toggle').click();
  const simple=await page.locator('body').evaluate(b=>getComputedStyle(b).getPropertyValue('--accent').trim());
  if(complete!==simple)throw Error('Tema no coincide entre vistas');
  await page.locator(`#pump-list [data-tag="${tag}"]`).click();
  await page.waitForTimeout(1500);
  console.log(JSON.stringify({tag,complete,simple,errors,canvas:await page.locator('#viewport canvas').count()}));
  await checkInterface({page,context,base,out,errors});
  if(errors.length)throw Error(errors.join('\n'));
 }finally{if(browser)await browser.close();srv.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});

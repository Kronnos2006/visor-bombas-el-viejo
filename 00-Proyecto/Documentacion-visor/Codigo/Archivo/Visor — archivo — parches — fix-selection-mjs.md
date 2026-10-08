# Visor/archivo/parches/fix-selection.mjs

Archivo del visor: archivo/parches/fix-selection.mjs

**Categoría:** Archivo. **Captura:** 2026-10-07.

Original: [abrir archivo](<<RUTA-LOCAL>/vocatus/auto cad/visor-bombas/archivo/parches/fix-selection.mjs>).

SHA-256: `955e4330c0862000f26aa05bd0ad197938e2778c50482aa795d5c4657be27ed1`

Esta es una copia documental. Código histórico; no ejecutar ni reponer sobre la aplicación actual.

````javascript
import {readFile,writeFile} from 'node:fs/promises';
const file=new URL('public/app.js',import.meta.url);let app=await readFile(file,'utf8');
function replace(a,b){if(!app.includes(a))throw new Error('Fragmento no encontrado: '+a.slice(0,90));app=app.replace(a,b);}
replace("if(!r.ok)throw new Error(data.error||'No se pudo completar la acción.');", "if(!r.ok){const error=new Error(data.error||'No se pudo completar la acción.');error.code=data.code;throw error;}");
replace("}catch(e){toast(e.message);}\n}\nfunction selectPart", "}catch(e){if(e.code==='PUMP_NOT_AVAILABLE'){state.pump=null;await refresh();if(state.pumps.length)await selectPump(state.pumps[0].tag);toast('Lista actualizada al modo activo.');}else toast(e.message);}\n}\nfunction selectPart");
replace("$('#area').value=area;", "$('#area').value=r.pumps.some(p=>p.area===area)?area:'';");
replace("if(state.pump){state.pump=await api('/api/pump?tag='+encodeURIComponent(state.pump.tag));renderPanel();}", "if(state.pump){const selected=state.pumps.find(p=>p.tag===state.pump.tag);if(selected){state.pump=await api('/api/pump?tag='+encodeURIComponent(selected.tag));renderPanel();}else{state.pump=null;state.answers={};$('#search').value='';if(state.pumps.length)await selectPump(state.pumps[0].tag);else{renderList();renderPanel();}toast('La selección anterior no pertenece al modo actual.');}}");
await writeFile(file,app);

````

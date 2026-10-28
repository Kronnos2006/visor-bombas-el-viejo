import test from 'node:test';
import assert from 'node:assert/strict';
import {savedSurveyHTML} from './public/survey-view.js';
import {writeSavedSurvey} from './public/survey-drafts.js';
function memory(){const data=new Map();return{getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};}
test('ficha muestra cambios guardados solo del TAG elegido sin confirmar Obsidian',()=>{
 const storage=memory();writeSavedSurvey({tag:'B30',author:'Prueba',fields:{sello_codigo:'SM-30'},fieldLabels:{sello_codigo:'Código del sello'},orings:[]},storage);
 const html=savedSurveyHTML('B30',storage);assert.match(html,/SM-30/);assert.match(html,/Código del sello/);assert.match(html,/Pendientes de trasladar a Obsidian/);assert.equal(savedSurveyHTML('B31',storage),'');
});
test('ficha escapa contenido, conserva retiros y comunica fallo de almacenamiento',()=>{
 const storage=memory();writeSavedSurvey({tag:'B30',author:'<img>',fields:{nombre:'<script>alert(1)</script>'},clearFields:{serie:'mala'},fieldLabels:{nombre:'Nombre',serie:'Serie'},replaceOrings:true,orings:[]},storage);
 const html=savedSurveyHTML('B30',storage);assert.doesNotMatch(html,/<script>|<img>/);assert.match(html,/&lt;script&gt;/);assert.match(html,/Retiro solicitado/);assert.match(html,/Lista vacía solicitada/);
 assert.match(savedSurveyHTML('B30',{getItem(){throw Error('bloqueado')}}),/No se pudo leer el cambio local/);
});

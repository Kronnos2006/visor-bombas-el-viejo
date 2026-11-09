// Cuida la memoria de video cuando el visor está abierto en varias pestañas.
// Cada pestaña con el 3D ocupa cientos de MB de la tarjeta de video; con 4 o 5 pestañas
// Chrome se queda sin memoria y apaga los 3D. Este módulo:
//  1. cuenta las pestañas del visor abiertas (BroadcastChannel) y avisa si hay más de una;
//  2. libera el 3D de una pestaña que lleva varios minutos oculta mientras hay otra abierta,
//     y lo vuelve a cargar cuando la persona regresa a ella.
export const ESPERA_LIBERAR_MS = 3 * 60 * 1000;
const LATIDO_MS = 15000, VENCE_MS = 40000;

export function contarOtras(vistas, ahora) {
 let n = 0;
 for (const visto of vistas.values()) if (ahora - visto < VENCE_MS) n++;
 return n;
}

export function vigilarPestanas({liberar, recargar, avisar, espera = ESPERA_LIBERAR_MS, doc = globalThis.document, Canal = globalThis.BroadcastChannel, reloj = () => Date.now()}) {
 const id = Math.random().toString(36).slice(2), otras = new Map();
 let canal = null, timer = 0, liberado = false, avisadas = 0;
 const otrasAbiertas = () => contarOtras(otras, reloj());
 const enviar = tipo => { try { canal?.postMessage({tipo, id}); } catch {} };
 const revisarAviso = () => {
  const n = otrasAbiertas();
  if (n > avisadas && !doc.hidden) avisar(n + 1);
  avisadas = n;
 };
 try {
  if (Canal) {
   canal = new Canal('vocatus-visor-pestanas');
   canal.onmessage = ({data}) => {
    if (!data || data.id === id) return;
    if (data.tipo === 'adios') { otras.delete(data.id); avisadas = Math.min(avisadas, otrasAbiertas()); return; }
    otras.set(data.id, reloj());
    if (data.tipo === 'hola') enviar('aqui');
    revisarAviso();
   };
   enviar('hola');
   setInterval(() => enviar('aqui'), LATIDO_MS);
   addEventListener('pagehide', () => enviar('adios'));
  }
 } catch { canal = null; }

 const alOcultar = () => {
  clearTimeout(timer);
  timer = setTimeout(() => { if (doc.hidden && !liberado && otrasAbiertas() > 0) { liberado = true; liberar(); } }, espera);
 };
 const alMostrar = () => {
  clearTimeout(timer);
  if (liberado) { liberado = false; recargar(); }
  revisarAviso();
 };
 doc.addEventListener('visibilitychange', () => (doc.hidden ? alOcultar() : alMostrar()));
 if (doc.hidden) alOcultar();
 return {otrasAbiertas, get liberado() { return liberado; }};
}

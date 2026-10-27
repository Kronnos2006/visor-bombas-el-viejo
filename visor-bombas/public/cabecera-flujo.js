// Firma visual de Vocatus: circuito ilustrativo, sin representar el estado real de los equipos.
export function crearFlujoCabecera(header) {
 const button=document.createElement('button');button.type='button';button.id='cab-flujo';button.setAttribute('aria-pressed','false');
 const label=paused=>{const text=paused?'Reanudar animación de cabecera':'Pausar animación de cabecera';button.title=text;button.setAttribute('aria-label',text);};label(false);
 button.innerHTML=`<svg viewBox="0 0 720 64" fill="none" aria-hidden="true" focusable="false">
  <defs><linearGradient id="cab-ambar" x1="0" y1="0" x2="720" y2="0" gradientUnits="userSpaceOnUse"><stop stop-color="currentColor" stop-opacity=".18"/><stop offset=".4" stop-color="currentColor"/><stop offset="1" stop-color="currentColor" stop-opacity=".35"/></linearGradient></defs>
  <path class="cab-tuberia" d="M8 32H130Q140 32 140 22V16Q140 10 150 10H182Q192 10 192 20V32H225M263 22V12Q263 6 275 6H351Q361 6 361 16V42Q361 50 373 50H490Q500 50 500 40V32H578"/>
  <path class="cab-corriente" d="M8 32H130Q140 32 140 22V16Q140 10 150 10H182Q192 10 192 20V32H225M263 22V12Q263 6 275 6H351Q361 6 361 16V42Q361 50 373 50H490Q500 50 500 40V32H578"/>
  <g class="cab-bomba"><path d="M207 51H276M214 46V51M264 45V51M208 27H225V37H208Z"/><circle cx="246" cy="32" r="21"/><circle cx="246" cy="32" r="15" opacity=".35"/>
   <g class="cab-impulsor"><path d="M246 32L246 19Q257 20 256 25ZM246 32L259 32Q258 43 253 42ZM246 32L246 45Q235 44 236 39ZM246 32L233 32Q234 21 239 22Z"/><circle cx="246" cy="32" r="3"/></g>
  </g>
  <g class="cab-planta"><path d="M566 53H709M576 53V27L591 22L606 27V53M576 30H606M576 41H606M584 26V52M598 26V52M618 53V18H638V53M618 18Q628 11 638 18M618 29H638M618 41H638M650 53V8H666V53M647 8H669M650 19H666M650 30H666M650 41H666M680 53V32H700V53M680 32Q690 24 700 32"/>
   <path class="cab-caida" d="M658 11V49M628 22V49M690 35V49"/>
  </g>
 </svg><span class="cab-pausa" aria-hidden="true">Ⅱ</span>`;
 button.onclick=()=>{const paused=button.getAttribute('aria-pressed')!=='true';button.setAttribute('aria-pressed',String(paused));label(paused);};header.append(button);
 return button;
}

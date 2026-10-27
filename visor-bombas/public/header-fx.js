// Efectos del encabezado de la app (logo, título y tubería), sin React y sin WebGL.
// Adaptado de React Bits por David Haz — SloshGauge (física del líquido), ShinyText (brillo del
// título) y GlareHover (destello del logo). MIT + Commons Clause; ver vendor/react-bits-LICENSE.md.

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const reduceQuery = matchMedia('(prefers-reduced-motion: reduce)');
// Quieto: «reducir movimiento» del sistema o la pausa del encabezado (botón de la app).
const quieto = () => reduceQuery.matches || document.body.classList.contains('tel-cab-pausa');

// ---------- Líquido de la tubería (SloshGauge) ----------
// Oscilador amortiguado: el nivel x persigue el objetivo L; la velocidad inclina la superficie.
const H = 1 / 120, DT_MAX = 0.05, REST_POS = 0.05, REST_VEL = 2;
export function sloshLiquid(el, {level = 64, viscosity = 0.32, tilt = 0.45, maxLean = 4, splash = 0.42} = {}) {
  const s = {x: 0, v: 0, L: level, raf: 0, last: 0};
  const paint = () => {
    const lean = quieto() ? 0 : clamp(tilt * s.v * 0.07, -maxLean, maxLean);
    const top = 100 - s.x;
    el.style.clipPath = `polygon(0 calc(${top}% + ${lean}px), 100% calc(${top}% - ${lean}px), 100% 100%, 0 100%)`;
  };
  const tick = now => {
    const dt = s.last ? Math.min((now - s.last) / 1000, DT_MAX) : H;
    s.last = now;
    const k = 1224 - 1044 * viscosity, zeta = quieto() ? 1 : 0.26 - 0.17 * viscosity, c = 2 * zeta * Math.sqrt(k);
    const rest = quieto() ? 0 : splash;
    for (let n = Math.ceil(dt / H), h = dt / n; n > 0; n--) {
      s.v = s.v * Math.exp(-c * h) + k * (s.L - s.x) * h;
      s.x += s.v * h;
      if (s.x > 100) { s.x = 100; s.v = -s.v * rest; } else if (s.x < 0) { s.x = 0; s.v = -s.v * rest; }
    }
    if (Math.abs(s.L - s.x) < REST_POS && Math.abs(s.v) < REST_VEL) { s.x = s.L; s.v = 0; }
    paint();
    if (s.x === s.L && s.v === 0) { s.raf = 0; s.last = 0; } else s.raf = requestAnimationFrame(tick);
  };
  const wake = () => { if (!s.raf) s.raf = requestAnimationFrame(tick); };
  paint(); wake(); // se llena al cargar
  return {
    // Un golpe de bomba: el líquido se mece y vuelve a su nivel.
    nudge(fuerza = 1) { s.v += (Math.random() < 0.5 ? -1 : 1) * 120 * fuerza; wake(); },
    set(level) { s.L = clamp(level, 0, 100); wake(); }
  };
}

// ---------- Brillo del título (ShinyText) ----------
const FALLOFF = [0, 0.2, 0.4, 0.6, 0.8, 1];
let paintCtx = null;
const parseColor = value => {
  if (!paintCtx) paintCtx = document.createElement('canvas').getContext('2d');
  if (!paintCtx) return null;
  paintCtx.fillStyle = '#000000'; paintCtx.fillStyle = value;
  const r = String(paintCtx.fillStyle);
  if (r.startsWith('#')) return [1, 3, 5].map(i => parseInt(r.slice(i, i + 2), 16)).concat(1);
  const p = r.match(/[\d.]+/g);
  return p && p.length >= 3 ? [+p[0], +p[1], +p[2], p.length > 3 ? +p[3] : 1] : null;
};
const blend = (from, to, t) => {
  const ch = (a, b) => Math.round(Math.pow(Math.pow(a / 255, 2.2) * (1 - t) + Math.pow(b / 255, 2.2) * t, 1 / 2.2) * 255);
  return `rgba(${ch(from[0], to[0])}, ${ch(from[1], to[1])}, ${ch(from[2], to[2])}, ${from[3] * (1 - t) + to[3] * t})`;
};
const smooth = t => 0.5 - Math.cos(Math.PI * t) / 2;
export function shinyText(el, {speed = 2.6, delay = 4.5, angle = 115, shineWidth = 34, softness = 0.8} = {}) {
  el.classList.add('shiny-text');
  const extent = shineWidth / 2 + 2, from = -extent, to = 100 + extent;
  let start = 0, raf = 0, timer = 0;
  const colors = () => { const cs = getComputedStyle(el); return [parseColor(cs.getPropertyValue('--shiny-base').trim() || cs.color), parseColor(cs.getPropertyValue('--shiny-shine').trim() || '#ffd486')]; };
  const gradient = (pos, base, shine) => {
    const half = shineWidth / 2, core = half * (1 - softness), fade = half - core, stops = [];
    for (const side of [-1, 1]) for (const f of FALLOFF) stops.push([pos + side * (core + fade * (1 - f)), f * f * (3 - 2 * f)]);
    stops.sort((a, b) => a[0] - b[0]);
    return `linear-gradient(${angle}deg, ${blend(base, shine, 0)} 0%, ${stops.map(([at, a]) => `${blend(base, shine, a)} ${at.toFixed(2)}%`).join(', ')}, ${blend(base, shine, 0)} 100%)`;
  };
  const plain = () => { const [b] = colors(); el.style.backgroundImage = b ? `linear-gradient(${blend(b, b, 0)}, ${blend(b, b, 0)})` : ''; };
  const tick = now => {
    const [base, shine] = colors();
    if (!base || !shine) return plain();
    const t = Math.min(1, (now - start) / (speed * 1000));
    el.style.backgroundImage = gradient(from + (to - from) * smooth(t), base, shine);
    if (t < 1) raf = requestAnimationFrame(tick); else { raf = 0; plain(); timer = setTimeout(go, delay * 1000); }
  };
  const go = () => { if (quieto() || document.hidden) { plain(); timer = setTimeout(go, delay * 1000); return; } start = performance.now(); raf = requestAnimationFrame(tick); };
  plain(); timer = setTimeout(go, 600);
  return { replay() { clearTimeout(timer); cancelAnimationFrame(raf); go(); } };
}

// ---------- Destello del logo (GlareHover, en bucle y al pasar el mouse) ----------
export function glare(img) {
  if (!img || img.parentElement?.classList.contains('glare-hover')) return;
  const wrap = document.createElement('span'); wrap.className = 'glare-hover';
  img.replaceWith(wrap); wrap.append(img);
  const band = document.createElement('span'); band.className = 'glare-hover__band'; band.setAttribute('aria-hidden', 'true');
  wrap.append(band);
}

// ---------- Resorte genérico (misma física de SloshGauge, para el título de vidrio) ----------
export function resorte({viscosity = 0.25, splash = 0.35, onPaint}) {
  const s = {x: 0, v: 0, L: 0, raf: 0, last: 0};
  const tick = now => {
    const dt = s.last ? Math.min((now - s.last) / 1000, DT_MAX) : H; s.last = now;
    const k = 1224 - 1044 * viscosity, zeta = quieto() ? 1 : 0.26 - 0.17 * viscosity, c = 2 * zeta * Math.sqrt(k);
    for (let n = Math.ceil(dt / H), h = dt / n; n > 0; n--) {
      s.v = s.v * Math.exp(-c * h) + k * (s.L - s.x) * h; s.x += s.v * h;
      if (s.x > 100) { s.x = 100; s.v = -s.v * splash; } else if (s.x < 0) { s.x = 0; s.v = -s.v * splash; }
    }
    if (Math.abs(s.L - s.x) < REST_POS && Math.abs(s.v) < REST_VEL) { s.x = s.L; s.v = 0; }
    onPaint(s.x, s.v);
    if (s.x === s.L && s.v === 0) { s.raf = 0; s.last = 0; } else s.raf = requestAnimationFrame(tick);
  };
  const wake = () => { if (!s.raf) s.raf = requestAnimationFrame(tick); };
  return {
    llenar(level, desdeCero = false) { if (desdeCero) { s.x = 0; s.v = 0; } s.L = clamp(level, 0, 100); if (quieto()) { s.x = s.L; s.v = 0; onPaint(s.x, 0); return; } wake(); },
    golpe(f = 1) { s.v += (Math.random() < 0.5 ? -1 : 1) * 90 * f; wake(); }
  };
}

const NS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs = {}) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); return e; };

// ---------- Título de vidrio que se llena de líquido ámbar (como la entrada) ----------
export function tituloVidrio(host) {
  host.textContent = '';
  const sr = document.createElement('span'); sr.className = 'tv-sr'; host.append(sr);
  const svg = svgEl('svg', {class: 'titulo-vidrio', 'aria-hidden': 'true'}); host.append(svg);
  svg.innerHTML = `<defs>
    <linearGradient id="tv-liq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffcf6e"/><stop offset=".35" stop-color="#e09a2c"/><stop offset="1" stop-color="#8a4a0b"/></linearGradient>
    <linearGradient id="tv-brillo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <clipPath id="tv-clip"><text class="tv-texto"></text></clipPath></defs>
    <g clip-path="url(#tv-clip)"><rect class="tv-vidrio" width="100%" height="100%"/>
     <g class="tv-ola"><path class="tv-ola-b"/><path class="tv-ola-a"/></g>
     <g class="tv-burbujas"><circle r="1.4"/><circle r="1"/><circle r="1.2"/></g></g>
    <text class="tv-texto tv-borde"></text><text class="tv-texto tv-reflejo"></text>`;
  const textos = [...svg.querySelectorAll('.tv-texto')], ola = svg.querySelector('.tv-ola');
  let W = 100, Hh = 40, base = 0;
  const onda = (amp, fase) => { const per = 34, pts = []; for (let x = -per * 2; x <= W + per * 2; x += 4) pts.push(`${x.toFixed(1)},${(Math.sin((x / per) * Math.PI * 2 + fase) * amp).toFixed(2)}`); return `M${pts.join(' L')} L${W + per * 2},${Hh * 2} L${-per * 2},${Hh * 2} Z`; };
  const medir = () => {
    const fs = parseFloat(getComputedStyle(host).fontSize) || 22;
    Hh = Math.round(fs * 1.25); base = Math.round(fs * 0.98);
    textos.forEach(t => { t.setAttribute('x', 1); t.setAttribute('y', base); });
    const ancho = Math.ceil(textos[1].getComputedTextLength?.() || fs * sr.textContent.length * 0.6) + 4;
    W = ancho; svg.setAttribute('width', W); svg.setAttribute('height', Hh); svg.setAttribute('viewBox', `0 0 ${W} ${Hh}`);
    svg.querySelector('.tv-ola-a').setAttribute('d', onda(1.8, 0)); svg.querySelector('.tv-ola-b').setAttribute('d', onda(2.4, 1.7));
  };
  const nivel = resorte({viscosity: 0.86, splash: 0.3, onPaint: (x, v) => {
    const inclin = quieto() ? 0 : clamp(v * 0.012, -4, 4);
    ola.setAttribute('transform', `translate(0 ${(Hh * (1 - x / 100)).toFixed(2)}) skewY(${inclin.toFixed(2)})`);
  }});
  return {
    poner(texto) {
      sr.textContent = texto; textos.forEach(t => t.textContent = texto); medir();
      nivel.llenar(0, true); setTimeout(() => nivel.llenar(74), 260);
      document.fonts?.ready.then(medir);
    },
    golpe: f => nivel.golpe(f)
  };
}

// ---------- Tubería de vidrio con curvas, bomba y cascada (encabezado) ----------
export function tuberia(host) {
  const svg = svgEl('svg', {class: 'tuberia', 'aria-hidden': 'true'}); host.append(svg);
  let largos = [0, 0], timers = [];
  const redondear = (crudos, r) => {
    // Sin puntos repetidos ni intermedios en línea recta (romperían el redondeo).
    const pts = crudos.filter((p, i, a) => !i || p[0] !== a[i - 1][0] || p[1] !== a[i - 1][1])
      .filter((p, i, a) => i === 0 || i === a.length - 1 || !((a[i - 1][0] === p[0] && p[0] === a[i + 1][0]) || (a[i - 1][1] === p[1] && p[1] === a[i + 1][1])));
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const [px, py] = pts[i - 1], [x, y] = pts[i], [nx, ny] = pts[i + 1];
      const d1 = Math.hypot(x - px, y - py), d2 = Math.hypot(nx - x, ny - y), rr = Math.min(r, d1 / 2, d2 / 2);
      const ax = x - ((x - px) / d1) * rr, ay = y - ((y - py) / d1) * rr, bx = x + ((nx - x) / d2) * rr, by = y + ((ny - y) / d2) * rr;
      d += ` L${ax.toFixed(1)},${ay.toFixed(1)} Q${x},${y} ${bx.toFixed(1)},${by.toFixed(1)}`;
    }
    const last = pts[pts.length - 1]; return d + ` L${last[0]},${last[1]}`;
  };
  const meandro = (x0, x1, mid, a, paso, empiezaArriba) => {
    const pts = []; let up = empiezaArriba, x = x0 + paso * 0.5;
    pts.push([x0, mid]); pts.push([x, mid]);
    while (x + paso <= x1 - paso * 0.5) { const y = up ? mid - a : mid + a; pts.push([x, y]); x += paso; pts.push([x, y]); up = !up; }
    pts.push([x, mid]); pts.push([x1, mid]); return pts;
  };
  const construir = () => {
    const W = Math.max(60, Math.round(host.clientWidth)), Hh = Math.max(30, Math.round(host.clientHeight));
    const mid = Math.round(Hh * 0.42), a = Math.round(Hh * 0.2), paso = W < 260 ? 22 : W < 700 ? 32 : 46, r = 6;
    const k = Hh > 50 ? 1.6 : 1; // bomba más grande en el encabezado alto de computadora
    const bombaX = Math.round(W * (W < 260 ? 0.34 : 0.4)), salida = W - 18, fondo = Hh - 4;
    const p1 = meandro(0, bombaX - Math.round(15 * k), mid, a, paso, true);
    const p2 = meandro(bombaX + Math.round(17 * k), salida - 10, mid, a, paso, false); p2.push([salida, mid]); p2.push([salida, mid + 6]);
    const d1 = redondear(p1, r), d2 = redondear(p2, r);
    svg.setAttribute('viewBox', `0 0 ${W} ${Hh}`); svg.setAttribute('width', W); svg.setAttribute('height', Hh);
    svg.innerHTML = `<defs>
      <linearGradient id="tb-liq" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${W}" y2="0"><stop offset="0" stop-color="#c38320"/><stop offset=".5" stop-color="#ffad32"/><stop offset="1" stop-color="#e3962a"/></linearGradient>
      <linearGradient id="tb-chorro" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffbb45"/><stop offset="1" stop-color="#c38320" stop-opacity=".2"/></linearGradient>
      <radialGradient id="tb-voluta" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#b9c6c4"/><stop offset=".55" stop-color="#5f7473"/><stop offset="1" stop-color="#243b3c"/></radialGradient>
      <filter id="tb-brillo" filterUnits="userSpaceOnUse" x="-10" y="-10" width="${W + 20}" height="${Hh + 20}"><feGaussianBlur stdDeviation="2.2"/></filter></defs>
      ${[d1, d2].map((d, i) => `<g class="tramo t${i}"><path class="tb-halo" d="${d}"/><path class="tb-vidrio" d="${d}"/><path class="tb-liquido" d="${d}"/><path class="tb-flujo" d="${d}"/><path class="tb-reflejo" d="${d}" transform="translate(0 -2)"/></g>`).join('')}
      <g class="tb-bomba" transform="translate(${bombaX} ${mid}) scale(${k})">
        <rect class="tb-base" x="-17" y="7" width="40" height="3.5" rx="1.5"/>
        <rect class="tb-motor" x="5" y="-6.5" width="17" height="13" rx="3"/>
        <path class="tb-aletas" d="M9 -6.5v13M12.5 -6.5v13M16 -6.5v13M19.5 -6.5v13"/>
        <circle class="tb-voluta" r="9"/><circle class="tb-ojo" r="3.2"/>
        <g class="tb-rotor"><path d="M0 -6.2 Q2.6 -3 0 0 M5.4 3.1 Q1.6 4 0 0 M-5.4 3.1 Q-4.2 -0.9 0 0"/></g></g>
      <g class="tb-cascada" transform="translate(${salida} ${mid + 6})">
        <path class="tb-chorro" d="M-1.6 0 Q-2.2 ${(fondo - mid - 6) * 0.6} -1 ${fondo - mid - 7} L1 ${fondo - mid - 7} Q2.2 ${(fondo - mid - 6) * 0.6} 1.6 0 Z"/>
        <circle class="tb-gota g1" r="1.2"/><circle class="tb-gota g2" r=".9"/><circle class="tb-gota g3" r="1.1"/>
        <ellipse class="tb-charco" cx="0" cy="${fondo - mid - 6}" rx="9" ry="1.8"/><ellipse class="tb-onda" cx="0" cy="${fondo - mid - 6}" rx="6" ry="1.2"/></g>`;
    svg.style.setProperty('--caida', `${fondo - mid - 7}px`);
    largos = [...svg.querySelectorAll('.tb-liquido')].map(p => p.getTotalLength());
    svg.querySelectorAll('.tramo').forEach((g, i) => { const L = largos[i]; g.style.setProperty('--L', L); g.querySelector('.tb-liquido').style.strokeDasharray = `${L} ${L}`; });
    llenar(true);
  };
  // El líquido avanza: tramo 1 → bomba → tramo 2 → cascada (como en la entrada).
  const llenar = (instantaneo = false) => {
    timers.forEach(clearTimeout); timers = [];
    const tramos = [...svg.querySelectorAll('.tramo')], cascada = svg.querySelector('.tb-cascada');
    if (!tramos.length) return;
    if (instantaneo || quieto()) { tramos.forEach(t => t.classList.add('lleno')); svg.classList.add('fluye'); cascada.classList.add('cae'); return; }
    svg.classList.remove('fluye'); cascada.classList.remove('cae'); tramos.forEach(t => t.classList.remove('lleno'));
    void svg.getBoundingClientRect();
    timers.push(setTimeout(() => tramos[0].classList.add('lleno'), 30));
    timers.push(setTimeout(() => { svg.classList.add('bombea'); tramos[1].classList.add('lleno'); }, 720));
    timers.push(setTimeout(() => { cascada.classList.add('cae'); svg.classList.add('fluye'); }, 1400));
    timers.push(setTimeout(() => svg.classList.remove('bombea'), 2200));
  };
  new ResizeObserver(() => { const w = Math.round(host.clientWidth), h = Math.round(host.clientHeight); if (w && h && (w !== +svg.getAttribute('width') || h !== +svg.getAttribute('height'))) construir(); }).observe(host);
  construir();
  return {llenar: () => llenar(false)};
}

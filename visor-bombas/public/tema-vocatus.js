// Tema Vocatus: portada, modo claro/oscuro, burbujas de fondo y efecto al tocar.
// Solo decora: no cambia ninguna función del visor.
(() => {
  const guardar = (k, v) => { try { localStorage.setItem(k, v); } catch {} };
  const leer = k => { try { return localStorage.getItem(k); } catch { return null; } };
  const sinMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const body = document.body;

  // 46 · Modo claro / oscuro
  // Vista simple / completa (también en las páginas de campo)
  const vistaBtn = document.getElementById('vista-toggle');
  if (vistaBtn && !vistaBtn.onclick) {
    const s = vistaBtn.querySelector('span');
    const pintarVista = () => { const completa = !body.classList.contains('facil'); vistaBtn.setAttribute('aria-pressed', completa); s.textContent = completa ? 'Vista simple' : 'Más opciones'; };
    vistaBtn.onclick = () => { body.classList.toggle('facil'); guardar('vocatus-vista', body.classList.contains('facil') ? 'simple' : 'completa'); pintarVista(); };
    pintarVista();
  }

  const tema = document.getElementById('tema-toggle');
  if (tema) {
  const pintarTema = () => {
    const claro = body.classList.contains('claro');
    tema.querySelector('b').textContent = claro ? '🌙' : '☀️';
    tema.querySelector('span').textContent = claro ? 'Oscuro' : 'Claro';
    tema.setAttribute('aria-pressed', claro);
  };
  if (leer('vocatus-tema') === 'claro') body.classList.add('claro');
  tema.onclick = () => {
    const cambiar = () => { body.classList.toggle('claro'); guardar('vocatus-tema', body.classList.contains('claro') ? 'claro' : 'oscuro'); pintarTema(); };
    if (document.startViewTransition && !sinMovimiento) document.startViewTransition(cambiar); else cambiar();
  };
  pintarTema();
  }

  // 45 · Portada (una vez por sesión). Si existe /portada.mp4 se usa de fondo.
  const portada = document.getElementById('portada');
  if (portada) {
  let vista = null; try { vista = sessionStorage.getItem('vocatus-portada-identidad-1'); } catch {}
  if (!vista && body.classList.contains('facil')) {
    portada.hidden = false;
    const canas = portada.querySelector('.canas');
    for (let i = 0; i < 26; i++) {
      const c = document.createElement('i'); c.className = 'cana';
      c.style.left = (i / 26 * 100 + Math.random() * 3) + '%';
      c.style.height = (90 + Math.random() * 180) + 'px';
      c.style.animationDelay = (-Math.random() * 5) + 's';
      canas.append(c);
    }
    const video = portada.querySelector('video');
    fetch('/portada.mp4', { method: 'HEAD' }).then(r => { if (r.ok && (r.headers.get('content-type') || '').startsWith('video')) { video.src = '/portada.mp4'; video.hidden = false; } }).catch(() => {});
    let entrando=false;
    const entrar = () => {
      if(entrando)return;entrando=true;
      try { sessionStorage.setItem('vocatus-portada-identidad-1', '1'); } catch {}
      const original=portada.querySelector('.portada-logo'),destino=document.querySelector('header .brand-logo');
      const finish=()=>{portada.hidden=true;video.pause();body.classList.remove('brand-arriving');body.classList.add('brand-landed');document.querySelector('.logo-transfer')?.remove();document.querySelector('header .brand')?.focus({preventScroll:true});};
      if(sinMovimiento||!original||!destino||!original.animate){finish();return;}
      const from=original.getBoundingClientRect(),to=destino.getBoundingClientRect();
      const flying=original.cloneNode(false);flying.className='logo-transfer';flying.alt='';flying.setAttribute('aria-hidden','true');
      Object.assign(flying.style,{left:from.left+'px',top:from.top+'px',width:from.width+'px',height:from.height+'px'});
      body.append(flying);body.classList.add('brand-arriving');original.style.visibility='hidden';portada.classList.add('salir');
      const animation=flying.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${to.left-from.left}px,${to.top-from.top}px) scale(${to.width/from.width})`,opacity:1}],{duration:650,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'});
      animation.finished.then(finish,finish);
    };
    portada.querySelector('button').onclick = entrar;
    addEventListener('keydown', e => { if (!portada.hidden && (e.key === 'Enter' || e.key === 'Escape')) entrar(); });
  }
  }

  // 44 · Burbujas de fondo, lentas y tenues
  const lienzo = document.getElementById('burbujas');
  if (lienzo && !sinMovimiento && lienzo.getContext) {
    const ctx = lienzo.getContext('2d');
    let w, h, dpr; const burbujas = [];
    const medir = () => { dpr = Math.min(devicePixelRatio || 1, 2); w = innerWidth; h = innerHeight; lienzo.width = w * dpr; lienzo.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    medir(); addEventListener('resize', medir);
    const nueva = (y) => ({ x: Math.random() * w, y: y ?? h + 20, r: 1.5 + Math.random() * 5, v: .15 + Math.random() * .45, f: Math.random() * 6.28, a: .05 + Math.random() * .12 });
    for (let i = 0; i < 34; i++) burbujas.push(nueva(Math.random() * h));
    const dibujar = () => {
      if (!document.hidden) {
        ctx.clearRect(0, 0, w, h);
        const claro = body.classList.contains('claro');
        for (const b of burbujas) {
          b.y -= b.v; b.f += .01; const x = b.x + Math.sin(b.f) * 8;
          if (b.y < -20) Object.assign(b, nueva());
          ctx.beginPath(); ctx.arc(x, b.y, b.r, 0, 6.283);
          ctx.fillStyle = claro ? `rgba(185,119,14,${b.a})` : `rgba(242,184,75,${b.a})`; ctx.fill();
        }
      }
      requestAnimationFrame(dibujar);
    };
    requestAnimationFrame(dibujar);
  }

  // 48 · Onda al tocar botones
  if (!sinMovimiento) document.addEventListener('pointerdown', e => {
    const el = e.target.closest('button,.main-nav a,.campo-nav a,.pump-row'); if (!el || el.disabled) return;
    const r = el.getBoundingClientRect(), d = Math.max(r.width, r.height);
    const o = document.createElement('span'); o.className = 'toque';
    Object.assign(o.style, { width: d + 'px', height: d + 'px', left: (e.clientX - r.left - d / 2) + 'px', top: (e.clientY - r.top - d / 2) + 'px' });
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    el.style.overflow = 'hidden'; el.append(o); setTimeout(() => o.remove(), 520);
  }, { passive: true });
})();

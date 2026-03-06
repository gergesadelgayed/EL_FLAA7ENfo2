/* ============================================================
   EL FLA7EN v3 — Master Script
   localStorage intro | Sound FX | Matrix | Particles | 3D Cards
   ============================================================ */

'use strict';

// ===== SOUND ENGINE (Web Audio API — no external files) =====
const SFX = (() => {
  let ctx = null;
  const init = () => { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){} };

  function play(type) {
    if (!ctx) init();
    if (!ctx) return;
    try {
      const g = ctx.createGain();
      g.connect(ctx.destination);
      const o = ctx.createOscillator();
      o.connect(g);

      if (type === 'click') {
        o.type = 'square';
        o.frequency.setValueAtTime(880, ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.08);
        g.gain.setValueAtTime(0.06, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        o.start(); o.stop(ctx.currentTime + 0.12);
      }
      if (type === 'hover') {
        o.type = 'sine';
        o.frequency.setValueAtTime(1200, ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.06);
        g.gain.setValueAtTime(0.03, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        o.start(); o.stop(ctx.currentTime + 0.08);
      }
      if (type === 'nav') {
        o.type = 'triangle';
        o.frequency.setValueAtTime(660, ctx.currentTime);
        o.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.05);
        g.gain.setValueAtTime(0.05, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        o.start(); o.stop(ctx.currentTime + 0.15);
      }
      if (type === 'boot') {
        // Ascending boot tone
        const notes = [220,330,440,660,880];
        notes.forEach((freq, i) => {
          const oi = ctx.createOscillator();
          const gi = ctx.createGain();
          oi.connect(gi); gi.connect(ctx.destination);
          oi.type = 'square';
          oi.frequency.value = freq;
          gi.gain.setValueAtTime(0, ctx.currentTime + i*0.1);
          gi.gain.linearRampToValueAtTime(0.04, ctx.currentTime + i*0.1 + 0.02);
          gi.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i*0.1 + 0.1);
          oi.start(ctx.currentTime + i*0.1);
          oi.stop(ctx.currentTime + i*0.1 + 0.12);
        });
      }
      if (type === 'access') {
        // "Access granted" fanfare
        const seq = [{f:440,t:0},{f:554,t:0.1},{f:659,t:0.2},{f:880,t:0.3}];
        seq.forEach(({f,t}) => {
          const oi = ctx.createOscillator();
          const gi = ctx.createGain();
          oi.connect(gi); gi.connect(ctx.destination);
          oi.type = 'sine';
          oi.frequency.value = f;
          gi.gain.setValueAtTime(0.08, ctx.currentTime+t);
          gi.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+t+0.15);
          oi.start(ctx.currentTime+t);
          oi.stop(ctx.currentTime+t+0.18);
        });
      }
    } catch(e){}
  }
  return { play, init };
})();

// ===== CURSOR =====
const CUR = (() => {
  const el = document.getElementById('cursor');
  const dot = document.getElementById('cursor-dot');
  if (!el || !dot) return;
  let mx=0,my=0,cx=0,cy=0;
  document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; });
  (function loop(){
    cx += (mx-cx)*0.22; cy += (my-cy)*0.22;
    el.style.left=mx+'px'; el.style.top=my+'px';
    dot.style.left=cx+'px'; dot.style.top=cy+'px';
    requestAnimationFrame(loop);
  })();

  function bind(selector, colorClass, sfx) {
    document.querySelectorAll(selector).forEach(n => {
      n.addEventListener('mouseenter', () => {
        el.classList.add('scale', colorClass||'');
        if(sfx) SFX.play(sfx);
      });
      n.addEventListener('mouseleave', () => {
        el.classList.remove('scale','hover-r','hover-b');
      });
    });
  }
  bind('.m-card', '', 'hover');
  bind('.wr-card', '', 'hover');
  bind('a:not(.nav-links a)', '', '');
  bind('.nav-links a', '', 'nav');
  bind('.btn', '', 'click');
  bind('.nav-join', '', 'click');
})();

// ===== MATRIX RAIN =====
function makeMatrix(id, color='#00ff9c', size=14, alpha=0.05) {
  const cv = document.getElementById(id);
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const CHARS = '01アイウエオカキサシスタチELFLA7EN!@#$%^&*<>{}░▓█▄▀';
  let W,H,cols,drops;
  const resize = () => {
    W = cv.width  = cv.offsetWidth  || window.innerWidth;
    H = cv.height = cv.offsetHeight || window.innerHeight;
    cols = Math.floor(W/size);
    drops = Array.from({length:cols}, () => Math.random()*-50);
  };
  resize();
  window.addEventListener('resize', resize);
  function draw() {
    ctx.fillStyle = `rgba(2,2,5,${alpha})`;
    ctx.fillRect(0,0,W,H);
    drops.forEach((y,i) => {
      const c = CHARS[Math.floor(Math.random()*CHARS.length)];
      const bright = Math.random()>0.96?'#fff':(Math.random()>0.85?'#00f0ff':color);
      ctx.fillStyle = bright;
      ctx.font = `${size}px 'Share Tech Mono',monospace`;
      ctx.fillText(c, i*size, y*size);
      if(y*size>H && Math.random()>0.978) drops[i]=0;
      drops[i] += 0.8 + Math.random()*0.3;
    });
  }
  return setInterval(draw, 55);
}

// ===== PARTICLE ENGINE =====
function makeParticles(id) {
  const cv = document.getElementById(id);
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const COLORS = ['#00ff9c','#ff2244','#00f0ff','#3a6aff','#00ff66','#4488ff'];
  let W, H;
  const resize = () => {
    W = cv.width  = cv.offsetWidth  || window.innerWidth;
    H = cv.height = cv.offsetHeight || window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  const pts = Array.from({length:60}, () => ({
    x: Math.random()*window.innerWidth,
    y: Math.random()*window.innerHeight,
    vx: (Math.random()-0.5)*0.4,
    vy: (Math.random()-0.5)*0.4,
    r: Math.random()*2+0.5,
    c: COLORS[Math.floor(Math.random()*COLORS.length)],
    a: Math.random()*0.6+0.2,
  }));

  function draw() {
    ctx.clearRect(0,0,W,H);
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if(p.x<0||p.x>W) p.vx*=-1;
      if(p.y<0||p.y>H) p.vy*=-1;
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle = p.c + Math.floor(p.a*255).toString(16).padStart(2,'0');
      ctx.fill();
    });
    // Draw connections
    pts.forEach((p,i) => {
      pts.slice(i+1).forEach(q => {
        const d = Math.hypot(p.x-q.x,p.y-q.y);
        if(d<120) {
          ctx.beginPath();
          ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y);
          ctx.strokeStyle = p.c + Math.floor((1-d/120)*0.15*255).toString(16).padStart(2,'0');
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });
    });
    requestAnimationFrame(draw);
  }
  draw();
}

// ===== INTRO — FIRST VISIT ONLY =====
;(function() {
  const INTRO_KEY = 'elfla7en_intro_shown';
  const intro = document.getElementById('intro');
  if (!intro) return;

  // Check if already shown
  if (localStorage.getItem(INTRO_KEY)) {
    intro.classList.add('hidden');
    return;
  }

  // Start matrix + boot sound
  makeMatrix('intro-mat', '#00ff9c', 13, 0.05);
  setTimeout(() => SFX.play('boot'), 300);

  // Terminal lines
  const lines = [
    { t:'Initializing Cyber Network...', d:150, cls:'' },
    { t:'Connecting to Secure Node...', d:750, cls:'' },
    { t:'Decrypting Access Layer...', d:1350, cls:'' },
    { t:'Verifying Identity...', d:1950, cls:'warn' },
    { t:'ACCESS GRANTED — WELCOME OPERATOR', d:2500, cls:'ok' },
  ];
  const term = document.getElementById('intro-terminal');
  if (term) {
    lines.forEach(({t,d,cls}) => {
      setTimeout(() => {
        const s = document.createElement('span');
        s.className = `i-line ${cls}`;
        s.textContent = t;
        term.appendChild(s);
        requestAnimationFrame(() => s.classList.add('show'));
      }, d);
    });
  }

  // Access granted sound
  setTimeout(() => SFX.play('access'), 2600);

  function dismiss() {
    localStorage.setItem(INTRO_KEY, '1');
    intro.classList.add('exit');
    setTimeout(() => { intro.classList.add('hidden'); }, 1200);
  }

  // Auto dismiss after 5.5s
  setTimeout(dismiss, 5500);
  intro.addEventListener('click', dismiss);
  const skip = document.getElementById('intro-skip');
  if (skip) skip.addEventListener('click', e => { e.stopPropagation(); dismiss(); });
})();

// ===== BG MATRIX + PARTICLES =====
document.addEventListener('DOMContentLoaded', () => {
  makeMatrix('bgCanvas','#00ff9c',14,0.04);
  makeParticles('particleCanvas');
});

// ===== NAV TOGGLE =====
const navToggle = document.querySelector('.nav-toggle');
const navLinks  = document.querySelector('.nav-links');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => { navLinks.classList.toggle('open'); SFX.play('nav'); });
}
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => SFX.play('nav'));
});

// ===== ACTIVE NAV =====
;(function(){
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if(href===page||(page===''&&href==='index.html')) a.classList.add('active');
  });
})();

// ===== SCROLL REVEAL =====
;(function(){
  const io = new IntersectionObserver(entries => {
    entries.forEach((e,i) => {
      if(!e.isIntersecting) return;
      const delay = +e.target.dataset.delay || i*70;
      setTimeout(() => e.target.classList.add('visible'), delay);
      io.unobserve(e.target);
    });
  }, {threshold:0.1, rootMargin:'0px 0px -40px 0px'});
  function observe() {
    document.querySelectorAll('.reveal,.tl-item').forEach((el,i) => {
      el.dataset.delay = el.dataset.delay || i*70;
      io.observe(el);
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', observe);
  else observe();
})();

// ===== COUNTER =====
;(function(){
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if(!e.isIntersecting) return;
      const el = e.target;
      const target = +el.dataset.target;
      let cur = 0;
      const step = Math.max(1,Math.ceil(target/50));
      const t = setInterval(() => {
        cur = Math.min(cur+step,target);
        el.textContent = cur+(el.dataset.suffix||'');
        if(cur>=target) clearInterval(t);
      }, 35);
      io.unobserve(el);
    });
  });
  function init(){ document.querySelectorAll('.counter').forEach(c => io.observe(c)); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();

// ===== 3D CARD TILT =====
;(function(){
  function init(){
    document.querySelectorAll('.m-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = e.clientX-r.left, y = e.clientY-r.top;
        const rx = ((y-r.height/2)/r.height)*-16;
        const ry = ((x-r.width/2)/r.width)*16;
        card.style.transform=`perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.04,1.04,1.04)`;
        card.style.setProperty('--mx',(x/r.width*100)+'%');
        card.style.setProperty('--my',(y/r.height*100)+'%');
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform='perspective(900px) rotateX(0) rotateY(0) scale3d(1,1,1)';
      });
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();

// ===== GLITCH DATA-TEXT SETUP =====
;(function(){
  function init(){ document.querySelectorAll('.glitch').forEach(el => el.dataset.text=el.textContent); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();

// ===== FILTER BUTTONS =====
;(function(){
  function init(){
    document.querySelectorAll('.fb').forEach(btn => {
      btn.addEventListener('click', () => {
        SFX.play('click');
        btn.closest('.filter-row').querySelectorAll('.fb').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();

// ===== ALL BUTTON CLICKS =====
document.addEventListener('click', e => {
  if(e.target.closest('.btn,.nav-join')) SFX.play('click');
});

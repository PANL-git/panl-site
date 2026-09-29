(function(){
  var reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Ouverture : une seule fois par session
  var intro = document.querySelector('.intro'), dejaVu = false;
  try { dejaVu = sessionStorage.getItem('panl-intro') === '1'; sessionStorage.setItem('panl-intro','1'); } catch(e){}
  if (intro && !reduit && !dejaVu) {
    intro.classList.add('joue');
    intro.addEventListener('animationend', function(ev){ if (ev.animationName === 'sortie') intro.classList.add('fini'); });
  }

  // Header : aplat nuit une fois le hero dépassé
  var header = document.querySelector('header');
  var titreHero = document.querySelector('.hero h1');
  if (titreHero) new IntersectionObserver(function(e){ header.classList.toggle('plein', !e[0].isIntersecting); }, {rootMargin:'-80px 0px 0px 0px'})
    .observe(titreHero);

  // Accordéon : survol ou focus ouvre un volet
  var volets = document.querySelectorAll('.volet');
  volets.forEach(function(v){
    function ouvre(){ volets.forEach(function(x){ x.classList.toggle('ouvert', x === v); }); }
    v.addEventListener('mouseenter', ouvre); v.addEventListener('focus', ouvre); v.addEventListener('click', ouvre);
  });

  // Apparitions + compteurs
  function compte(el){
    var n = +el.dataset.n, t0 = null, d = 1100;
    function pas(t){ if(!t0) t0 = t; var k = Math.min(1,(t - t0)/d); el.textContent = Math.round(n * (1 - Math.pow(1 - k, 3))); if(k < 1) requestAnimationFrame(pas); }
    requestAnimationFrame(pas);
  }
  var obs = new IntersectionObserver(function(entrees){
    entrees.forEach(function(e){
      if(!e.isIntersecting) return;
      e.target.classList.add('vu');
      if(!reduit) e.target.querySelectorAll('.compte').forEach(compte);
      obs.unobserve(e.target);
    });
  }, {threshold:.15});
  document.querySelectorAll('.rv').forEach(function(el){ reduit ? el.classList.add('vu') : obs.observe(el); });
  setTimeout(function(){ document.querySelectorAll('.rv').forEach(function(el){ el.classList.add('vu'); }); }, 1500);
})();

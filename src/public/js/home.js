(function(){
  const slides = Array.from(document.querySelectorAll('.slide'));
  if (!slides.length) return;
  let idx = slides.findIndex(s=>s.classList.contains('active'));
  if (idx < 0) idx = 0;
  let timer = null;
  const interval = 4500;

  function show(i){
    slides.forEach((s,si)=> s.classList.toggle('active', si===i));
  }

  function next(){ idx = (idx+1) % slides.length; show(idx); }

  // Pause on hover / touch for accessibility
  const carousel = document.querySelector('.carousel');
  carousel?.addEventListener('mouseenter', ()=>{ clearInterval(timer); });
  carousel?.addEventListener('mouseleave', ()=>{ resetTimer(); });
  carousel?.addEventListener('touchstart', ()=>{ clearInterval(timer); }, {passive:true});
  carousel?.addEventListener('touchend', ()=>{ resetTimer(); }, {passive:true});

  function resetTimer(){ clearInterval(timer); timer = setInterval(next, interval); }
  resetTimer();
})();

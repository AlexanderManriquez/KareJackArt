// Simple SPA-like navigation for gallery <-> artwork detail
(function(){
  if (!('fetch' in window)) return; // graceful degrade

  function attachHandlers(root=document){
    root.querySelectorAll('a[data-ajax="artwork"], a[data-ajax="gallery"]').forEach(a=>{
      if (a._spaAttached) return; a._spaAttached = true;
      a.addEventListener('click', function(e){
        const href = a.getAttribute('href');
        if (!href || href.indexOf(window.location.origin)===0) return; // absolute origin handled normally
        // allow cmd/ctrl+click
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button!==0) return;
        e.preventDefault();
        navigate(href);
      });
    });

    // also set up lazy loading for images within this root
    attachLazyLoad(root);
  }

  // Lazy loading using IntersectionObserver
  let lazyObserver = null;
  function attachLazyLoad(root=document){
    const imgs = Array.from(root.querySelectorAll('img.lazy'));
    if (!imgs.length) return;

    if (!('IntersectionObserver' in window)){
      // fallback: load all immediately
      imgs.forEach(loadImage);
      return;
    }

    if (!lazyObserver) {
      lazyObserver = new IntersectionObserver((entries)=>{
        entries.forEach(entry=>{
          if (entry.isIntersecting){
            const img = entry.target;
            lazyObserver.unobserve(img);
            loadImage(img);
          }
        });
      },{rootMargin:'200px 0px'});
    }

    imgs.forEach(img=>{ if (!img.datasetSrc && img.dataset && img.dataset.src) img.datasetSrc = img.dataset.src; lazyObserver.observe(img); });
  }

  function loadImage(img){
    const src = img.getAttribute('data-src') || img.datasetSrc || img.dataset.src;
    if (!src) return;
    // ensure the browser knows this image is lazy-loadable when possible
    if (!img.hasAttribute('loading')) img.setAttribute('loading','lazy');
    img.src = src;
    img.addEventListener('load', ()=>{
      img.classList.remove('lazy');
      img.classList.add('loaded');
      announceLoaded(img);
    }, {once:true});
    img.removeAttribute('data-src');
  }

  function announceLoaded(img){
    try{
      const status = document.getElementById('gallery-status');
      if (!status) return;
      const title = img.alt || 'obra';
      status.textContent = `Imagen cargada: ${title}`;
      // clear after a short delay so screen readers will re-announce later events
      setTimeout(()=>{ status.textContent = ''; }, 1200);
    }catch(e){}
  }

  async function navigate(url){
    try{
      const res = await fetch(url, {headers:{'X-Requested-With':'XMLHttpRequest'}});
      if (!res.ok) { window.location = url; return; }
      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const main = doc.querySelector('main') || doc.body;
      if (!main) { window.location = url; return; }
      // replace current main
      const currentMain = document.querySelector('main');
      if (currentMain) currentMain.replaceWith(main);
      else document.body.appendChild(main);

      // update title if present
      const title = doc.querySelector('title');
      if (title) document.title = title.textContent;

      // update history
      window.history.pushState({url:url}, '', url);

      // re-attach handlers to new content
      attachHandlers(document);
      // run any inline scripts from fetched page (basic)
      Array.from(doc.scripts||[]).forEach(s=>{ if (s.src) return; try{ eval(s.textContent); }catch(e){} });
    }catch(err){ console.error('Navigation failed', err); window.location = url; }
  }

  // on popstate, fetch content for location.pathname
  window.addEventListener('popstate', function(){
    const url = window.location.pathname;
    // fetch without pushing state
    fetch(url, {headers:{'X-Requested-With':'XMLHttpRequest'}}).then(r=>r.text()).then(html=>{
      const parser = new DOMParser(); const doc = parser.parseFromString(html,'text/html');
      const main = doc.querySelector('main') || doc.body; if (!main) return; const currentMain = document.querySelector('main'); if (currentMain) currentMain.replaceWith(main);
      attachHandlers(document);
    }).catch(()=>{});
  });

  // initial attach
  document.addEventListener('DOMContentLoaded', ()=> attachHandlers(document));
})();

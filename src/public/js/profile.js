(function(){
  const form = document.getElementById('profileForm');
  const messageEl = document.getElementById('profileMessage');
  if(!form) return;

  form.addEventListener('submit', async function(e){
    e.preventDefault();
    if(messageEl) { messageEl.textContent = 'Guardando...'; messageEl.className = 'message message--info'; }
    const fd = new FormData(form);
    try{
      const res = await fetch('/api/users/me', { method: 'PUT', body: fd, credentials: 'include', headers: {'X-Requested-With':'XMLHttpRequest'} });
      const json = await res.json();
      if(!res.ok) throw new Error(json.error || 'Error actualizando');
      if(messageEl) { messageEl.textContent = json.message || 'Guardado'; messageEl.className = 'message message--success'; }
      // update avatar on page if returned
      if(json.updated && json.updated.avatarUrl){
        const avatarImg = document.querySelector('.profile-avatar');
        if(avatarImg) avatarImg.src = json.updated.avatarUrl;
      }
    }catch(err){
      console.error(err);
      if(messageEl) { messageEl.textContent = err.message; messageEl.className = 'message message--error'; }
    }
  });
})();

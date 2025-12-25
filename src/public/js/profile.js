(function(){
  const form = document.getElementById('profileForm');
  const messageEl = document.getElementById('profileMessage');
  if(!form) return;

  // avatar preview elements
  const avatarInput = document.getElementById('avatar');
  const avatarPreview = document.querySelector('.profile-avatar');
  const previewWrapper = avatarPreview ? avatarPreview.parentElement : null;
  if (avatarInput && avatarPreview) {
    avatarInput.addEventListener('change', function(e){
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const allowed = ['image/webp','image/jpeg','image/png'];
      if (!allowed.includes(f.type)) {
        messageEl && (messageEl.textContent = 'Formato no permitido (webp, jpg, png)');
        messageEl && (messageEl.className = 'message message--error');
        return;
      }
      const reader = new FileReader();
      reader.onload = function(ev){
        avatarPreview.src = ev.target.result;
      };
      reader.readAsDataURL(f);
    });
  }

  form.addEventListener('submit', async function(e){
    e.preventDefault();
    if(messageEl) { messageEl.textContent = 'Guardando...'; messageEl.className = 'message message--info'; }
    const fd = new FormData(form);
    // include radio choice if present
    const choice = form.querySelector('input[name="avatarChoice"]:checked');
    if (choice) fd.set('avatarChoice', choice.value);
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

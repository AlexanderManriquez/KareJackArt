// Optional AJAX login helper: intercept form submit, POST JSON, follow redirect on success
(function(){
  const form = document.getElementById('login-form');
  const logoutForm = document.getElementById('logout-form');
  const errorEl = document.getElementById('login-error');

  function showSpinner(button){
    if (!button) return;
    button.setAttribute('disabled','true');
    button.classList.add('disabled');
    button.setAttribute('aria-busy','true');
    const spinner = button.querySelector('.spinner');
    if (spinner) spinner.classList.add('visible');
  }
  function hideSpinner(button){
    if (!button) return;
    button.removeAttribute('disabled');
    button.classList.remove('disabled');
    button.removeAttribute('aria-busy');
    const spinner = button.querySelector('.spinner');
    if (spinner) spinner.classList.remove('visible');
  }

  if (form){
    form.addEventListener('submit', async function(e){
      // If user holds modifier keys or requests normal submit, do not intercept
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();

      const submitBtn = document.getElementById('login-submit');
      showSpinner(submitBtn);
      errorEl.classList.add('visually-hidden');

      const data = new FormData(form);
      const payload = { email: data.get('email'), password: data.get('password') };

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Requested-With':'XMLHttpRequest' },
          body: JSON.stringify(payload),
          credentials: 'same-origin'
        });

        const json = await res.json();
        if (!res.ok) {
          errorEl.textContent = json.error || json.message || 'Error en el inicio de sesión';
          errorEl.classList.remove('visually-hidden');
          errorEl.focus();
          hideSpinner(submitBtn);
          return;
        }

        // On success, follow server-provided redirect if present
        const redirect = json && json.redirect ? json.redirect : '/profile';
        window.location.href = redirect;

      } catch (err) {
        errorEl.textContent = 'No se pudo conectar con el servidor.';
        errorEl.classList.remove('visually-hidden');
        errorEl.focus();
        hideSpinner(submitBtn);
      }
    });
  }

  if (logoutForm){
    logoutForm.addEventListener('submit', async function(e){
      // let normal non-js submit work when modifier keys used
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      const btn = document.getElementById('logout-button');
      showSpinner(btn);
      try {
        const res = await fetch(logoutForm.action, { method: 'POST', credentials: 'same-origin', headers: {'X-Requested-With':'XMLHttpRequest'} });
        if (res.ok){
          // reload page to update nav
          window.location.href = '/';
          return;
        }
      } catch (err) {
        // fallthrough to normal submit as fallback
      }
      // If AJAX failed, submit the form normally to ensure logout
      try { logoutForm.submit(); } catch(e){ hideSpinner(btn); }
    });
  }
})();

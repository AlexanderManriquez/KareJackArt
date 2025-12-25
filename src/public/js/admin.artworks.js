(function(){
  const listEl = document.getElementById('artworks-list');
  const formModal = document.getElementById('artwork-form-modal');
  const form = document.getElementById('artworkForm');
  const createBtn = document.getElementById('openCreateForm');
  const message = document.getElementById('message');
  let editingId = null;

  function showMessage(text, color='black'){
    if(!message) return;
    message.style.color = color;
    message.textContent = text;
  }

  let artworksCache = [];
  async function fetchArtworks(){
    try{
      const res = await fetch('/api/artworks');
      const artworks = await res.json();
      artworksCache = artworks;
      renderTable(artworks);
    }catch(e){
      console.error('Error loading artworks', e);
      showMessage('No se pudieron cargar las obras', 'red');
    }
  }

  function renderTable(items){
    if(!listEl) return;
    listEl.innerHTML = '';
    if(!items || items.length === 0){
      listEl.innerHTML = '<tr><td colspan="5">No hay obras</td></tr>';
      return;
    }
    const rows = items.map(a => {
      const thumb = `<img src="${a.imageUrl}" alt="${a.title}" style="width:60px;height:60px;object-fit:cover;border-radius:6px">`;
      return `
        <tr data-id="${a.id}">
          <td>${thumb}</td>
          <td>${a.title}</td>
          <td>${a.year || ''}</td>
          <td>${a.slug}</td>
          <td>
            <button class="edit-btn">Editar</button>
            <button class="delete-btn">Eliminar</button>
          </td>
        </tr>
      `;
    }).join('');
    listEl.innerHTML = rows;
    attachRowListeners();
  }

  function attachRowListeners(){
    document.querySelectorAll('#artworks-list .edit-btn').forEach(btn=>{
      btn.addEventListener('click', onEditClick);
    });
    document.querySelectorAll('#artworks-list .delete-btn').forEach(btn=>{
      btn.addEventListener('click', onDeleteClick);
    });
  }

  function onEditClick(e){
    const tr = e.target.closest('tr');
    const id = tr.dataset.id;
    const art = artworksCache.find(a => String(a.id) === String(id));
    if(!art){ showMessage('Obra no encontrada', 'red'); return; }
    populateForm(art);
    editingId = id;
    showFormModal(true);
  }

  async function onDeleteClick(e){
    const tr = e.target.closest('tr');
    const id = tr.dataset.id;
    if(!confirm('Eliminar obra? Esta acción es irreversible')) return;
    try{
      const res = await fetch('/api/artworks/' + id, { method: 'DELETE', credentials: 'include', headers: {'X-Requested-With':'XMLHttpRequest'} });
      if(!res.ok) throw new Error('Error eliminando');
      showMessage('Obra eliminada', 'green');
      fetchArtworks();
    }catch(err){
      console.error(err);
      showMessage('No se pudo eliminar la obra', 'red');
    }
  }

  function populateForm(art){
    form.title.value = art.title || '';
    form.slug.value = art.slug || '';
    form.description.value = art.description || '';
    form.dimensions.value = art.dimensions || '';
    form.year.value = art.year || '';
    form.isFeatured.checked = !!art.isFeatured;
  }

  function showFormModal(show){
    if(!formModal) return;
    if(show) formModal.classList.add('show'); else formModal.classList.remove('show');
    if(show) window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  createBtn && createBtn.addEventListener('click', ()=>{
    editingId = null;
    form.reset();
    showFormModal(true);
  });

  const closeModalBtn = document.getElementById('closeModal');
  closeModalBtn && closeModalBtn.addEventListener('click', ()=> showFormModal(false));

  // submit handler enhanced for create/update
  form && form.addEventListener('submit', async function(e){
    e.preventDefault();
    showMessage('Subiendo...', 'black');
    const fd = new FormData(form);
    try{
      let url = '/api/artworks';
      let method = 'POST';
      if (editingId) { url = '/api/artworks/' + editingId; method = 'PUT'; }
      const res = await fetch(url, { method, body: fd, credentials: 'include', headers: {'X-Requested-With':'XMLHttpRequest'} });
      const json = await res.json();
      if(!res.ok){ showMessage(json.error || 'Error', 'red'); return; }
      showMessage(editingId ? 'Obra actualizada' : 'Obra creada', 'green');
      form.reset();
      showFormModal(false);
      fetchArtworks();
    }catch(err){
      console.error(err);
      showMessage('Error al enviar', 'red');
    }
  });

  // Cancel form modal when clicking outside or pressing Esc
  document.addEventListener('click', function(e){
    if(!formModal) return;
    if(e.target === formModal){ showFormModal(false); }
  });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') showFormModal(false); });

  // init
  fetchArtworks();
})();

(() => {
  const adminName = document.getElementById('admin-name');
  const adminRole = document.getElementById('admin-role');
  const logoutButton = document.getElementById('logout-button');
  const sessionStatus = document.getElementById('session-status');
  const pageTitle = document.getElementById('page-title');
  const overviewPanel = document.getElementById('overview-panel');
  const managerPanel = document.getElementById('manager-panel');
  const moduleTitle = document.getElementById('module-title');
  const moduleDescription = document.getElementById('module-description');
  const moduleAlert = document.getElementById('module-alert');
  const recordsList = document.getElementById('records-list');
  const recordCount = document.getElementById('record-count');
  const searchInput = document.getElementById('search-input');
  const refreshButton = document.getElementById('refresh-button');
  const newButton = document.getElementById('new-button');
  const editorCard = document.getElementById('editor-card');
  const editorTitle = document.getElementById('editor-title');
  const closeEditor = document.getElementById('close-editor');
  const cancelButton = document.getElementById('cancel-button');
  const saveButton = document.getElementById('save-button');
  const recordForm = document.getElementById('record-form');
  const recordId = document.getElementById('record-id');
  const formFields = document.getElementById('form-fields');
  const confirmDialog = document.getElementById('confirm-dialog');

  const modules = {
    leadership: {
      title: 'Leadership',
      description: 'Manage leadership profiles, positions, biographies, photos, contact details and website display order.',
      primary: 'name', secondary: 'position',
      fields: [
        ['name','Full name','text',true], ['position','Position / Role','text',true],
        ['location','Location','text'], ['contact','Contact','text'], ['email','Email','email'],
        ['bio','Biography','textarea'], ['photo_url','Photo URL / asset path','text'],
        ['is_founder','Founder','checkbox'], ['display_order','Display order','number'], ['is_active','Active on website','checkbox']
      ]
    },
    services: {
      title: 'Services',
      description: 'Manage M-TECH services, short and full descriptions, icons, images and display order.',
      primary: 'name', secondary: 'short_description',
      fields: [
        ['name','Service name','text',true], ['short_description','Short description','textarea'],
        ['full_description','Full description','textarea'], ['icon','Icon / symbol','text'],
        ['image_url','Image URL / asset path','text'], ['display_order','Display order','number'], ['is_active','Active on website','checkbox']
      ]
    },
    portfolio: {
      title: 'Portfolio',
      description: 'Manage completed projects, categories, project stories, results, images and featured status.',
      primary: 'title', secondary: 'category',
      fields: [
        ['title','Project title','text',true], ['category','Category','text',true],
        ['description','Description','textarea'], ['image_url','Image URL / asset path','text'],
        ['project_date','Project date','text'], ['location','Location','text'],
        ['problem','Problem / Need','textarea'], ['solution','Solution delivered','textarea'], ['result','Result / Outcome','textarea'],
        ['is_featured','Featured project','checkbox'], ['display_order','Display order','number'], ['is_active','Active on website','checkbox']
      ]
    },
    testimonials: {
      title: 'Testimonials & Client Trust',
      description: 'Manage approved client trust entries. Only use genuine approved testimonial wording; do not invent client quotations.',
      primary: 'client_name', secondary: 'company_name',
      fields: [
        ['client_name','Client / representative name','text',true], ['company_name','Company / organization','text'],
        ['position','Position / relationship','text'], ['testimonial','Approved testimonial / trust statement','textarea',true],
        ['client_photo_url','Client photo / logo path','text'], ['rating','Rating (1–5)','number'],
        ['display_order','Display order','number'], ['is_active','Active on website','checkbox']
      ]
    },
    messages: {
      title: 'Contact Messages',
      description: 'Review enquiries submitted through the website, update their status and keep private administrative notes.',
      primary: 'name', secondary: 'subject', noCreate: true,
      fields: [
        ['name','Name','text',false,'readonly'], ['email','Email','text',false,'readonly'],
        ['phone','Phone','text',false,'readonly'], ['subject','Subject','text',false,'readonly'],
        ['message','Message','textarea',false,'readonly'],
        ['status','Status','select',false,['new','in_progress','replied','closed']], ['admin_notes','Private admin notes','textarea']
      ]
    },
    settings: {
      title: 'Site Settings',
      description: 'Manage reusable website and business values such as telephone numbers, WhatsApp details, address, email and selected text.',
      primary: 'setting_key', secondary: 'setting_group',
      fields: [
        ['setting_key','Setting key','text',true], ['setting_value','Setting value','textarea'], ['setting_group','Group','text']
      ]
    }
  };

  let currentResource = '';
  let currentRows = [];
  let selectedRow = null;
  let deleteButton = null;

  function setAlert(message = '', kind = '') {
    moduleAlert.textContent = message;
    moduleAlert.className = `alert ${kind}`.trim();
  }

  function api(resource, options = {}) {
    const method = options.method || 'GET';
    const fetchOptions = { method, credentials: 'same-origin', headers: {} };
    let url = `/api/admin/manage?resource=${encodeURIComponent(resource)}`;
    if (options.body) {
      fetchOptions.headers['content-type'] = 'application/json';
      fetchOptions.body = JSON.stringify(options.body);
    }
    return fetch(url, fetchOptions).then(async (response) => {
      const result = await response.json().catch(() => ({}));
      if (response.status === 401) {
        window.location.replace('/admin/login');
        throw new Error('Session expired.');
      }
      if (!response.ok || !result.ok) throw new Error(result.error || 'Request failed.');
      return result;
    });
  }

  async function loadSession() {
    try {
      const response = await fetch('/api/admin/session', { credentials: 'same-origin' });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        window.location.replace('/admin/login');
        return false;
      }
      adminName.textContent = result.user.fullName || result.user.username || 'Administrator';
      adminRole.textContent = result.user.role || 'admin';
      return true;
    } catch {
      sessionStatus.textContent = 'Could not verify your admin session. Please sign in again.';
      setTimeout(() => window.location.replace('/admin/login'), 900);
      return false;
    }
  }

  function showOverview() {
    currentResource = '';
    pageTitle.textContent = 'Dashboard';
    overviewPanel.classList.add('active');
    managerPanel.classList.remove('active');
    document.querySelectorAll('.nav-link').forEach((b) => b.classList.toggle('active', b.dataset.section === 'overview'));
    loadStats();
  }

  async function openModule(resource) {
    const config = modules[resource];
    if (!config) return;
    currentResource = resource;
    selectedRow = null;
    pageTitle.textContent = config.title;
    moduleTitle.textContent = config.title;
    moduleDescription.textContent = config.description;
    newButton.hidden = Boolean(config.noCreate);
    overviewPanel.classList.remove('active');
    managerPanel.classList.add('active');
    document.querySelectorAll('.nav-link').forEach((b) => b.classList.toggle('active', b.dataset.section === resource));
    searchInput.value = '';
    hideEditor();
    await loadRows();
  }

  async function loadRows() {
    if (!currentResource) return;
    setAlert('');
    recordsList.innerHTML = '<div class="empty-state">Loading records…</div>';
    try {
      const result = await api(currentResource);
      currentRows = result.rows || [];
      renderRows();
    } catch (error) {
      currentRows = [];
      recordsList.innerHTML = '<div class="empty-state">Could not load records.</div>';
      setAlert(error.message, 'error');
    }
  }

  function searchableText(row) {
    return Object.values(row || {}).filter((v) => v !== null && v !== undefined).join(' ').toLowerCase();
  }

  function formatMeta(row, resource) {
    if (resource === 'messages') return `${row.email || row.phone || 'No contact'} • ${row.status || 'new'}`;
    if (resource === 'settings') return row.setting_group || 'general';
    const config = modules[resource];
    return row[config.secondary] || '';
  }

  function renderRows() {
    const config = modules[currentResource];
    const q = searchInput.value.trim().toLowerCase();
    const rows = q ? currentRows.filter((row) => searchableText(row).includes(q)) : currentRows;
    recordCount.textContent = `${rows.length} record${rows.length === 1 ? '' : 's'}`;
    recordsList.replaceChildren();

    if (!rows.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = q ? 'No records match your search.' : 'No records yet.';
      recordsList.appendChild(empty);
      return;
    }

    rows.forEach((row) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `record-row${selectedRow?.id === row.id ? ' active' : ''}`;
      const main = document.createElement('div');
      main.className = 'record-main';
      const title = document.createElement('div');
      title.className = 'record-title';
      title.textContent = row[config.primary] || `Record #${row.id}`;
      const meta = document.createElement('div');
      meta.className = 'record-meta';
      meta.textContent = formatMeta(row, currentResource);
      main.append(title, meta);

      const badges = document.createElement('div');
      badges.className = 'record-badges';
      if ('is_active' in row) {
        const badge = document.createElement('span');
        badge.className = `badge ${Number(row.is_active) ? 'active' : 'inactive'}`;
        badge.textContent = Number(row.is_active) ? 'Active' : 'Hidden';
        badges.appendChild(badge);
      }
      if (currentResource === 'messages') {
        const badge = document.createElement('span');
        badge.className = 'badge';
        badge.textContent = row.status || 'new';
        badges.appendChild(badge);
      }
      if (currentResource === 'portfolio' && Number(row.is_featured)) {
        const badge = document.createElement('span');
        badge.className = 'badge active';
        badge.textContent = 'Featured';
        badges.appendChild(badge);
      }

      button.append(main, badges);
      button.addEventListener('click', () => editRow(row));
      recordsList.appendChild(button);
    });
  }

  function inputForField(def, row = {}) {
    const [name, label, type, required = false, extra] = def;
    const wrap = document.createElement('div');
    wrap.className = `field${type === 'textarea' ? ' full' : ''}`;
    const lab = document.createElement('label');
    lab.htmlFor = `field-${name}`;
    lab.textContent = label;
    let input;

    if (type === 'textarea') {
      input = document.createElement('textarea');
    } else if (type === 'select') {
      input = document.createElement('select');
      (extra || []).forEach((optionValue) => {
        const option = document.createElement('option');
        option.value = optionValue;
        option.textContent = optionValue.replaceAll('_', ' ');
        input.appendChild(option);
      });
    } else if (type === 'checkbox') {
      const checkboxWrap = document.createElement('div');
      checkboxWrap.className = 'checkbox-wrap';
      input = document.createElement('input');
      input.type = 'checkbox';
      input.id = `field-${name}`;
      input.name = name;
      input.checked = name === 'is_active' ? (row[name] === undefined ? true : Boolean(Number(row[name]))) : Boolean(Number(row[name]));
      const text = document.createElement('span');
      text.textContent = label;
      checkboxWrap.append(input, text);
      wrap.appendChild(checkboxWrap);
      return wrap;
    } else {
      input = document.createElement('input');
      input.type = type;
      if (type === 'number') input.step = '1';
    }

    input.id = `field-${name}`;
    input.name = name;
    input.required = Boolean(required);
    if (extra === 'readonly') input.readOnly = true;
    const value = row[name];
    input.value = value === null || value === undefined ? '' : String(value);
    wrap.append(lab, input);
    return wrap;
  }

  function buildForm(row = {}) {
    const config = modules[currentResource];
    formFields.replaceChildren();
    config.fields.forEach((def) => formFields.appendChild(inputForField(def, row)));
    recordId.value = row.id || '';
    editorTitle.textContent = row.id ? `Edit ${config.title}` : `Add ${config.title}`;

    if (deleteButton) deleteButton.remove();
    deleteButton = null;
    if (row.id) {
      deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'danger';
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', () => requestDelete(row));
      document.querySelector('.form-actions').prepend(deleteButton);
    }
  }

  function editRow(row) {
    selectedRow = row;
    buildForm(row);
    editorCard.hidden = false;
    renderRows();
    if (window.innerWidth < 1250) editorCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function newRow() {
    selectedRow = null;
    buildForm({ is_active: 1, rating: 5, display_order: 0, status: 'new' });
    editorCard.hidden = false;
    renderRows();
    if (window.innerWidth < 1250) editorCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function hideEditor() {
    selectedRow = null;
    editorCard.hidden = true;
    recordForm.reset();
    formFields.replaceChildren();
    recordId.value = '';
    if (deleteButton) deleteButton.remove();
    deleteButton = null;
    if (currentResource) renderRows();
  }

  function formDataObject() {
    const config = modules[currentResource];
    const fd = new FormData(recordForm);
    const data = {};
    config.fields.forEach(([name,,type,,extra]) => {
      if (extra === 'readonly') return;
      if (type === 'checkbox') {
        data[name] = document.getElementById(`field-${name}`).checked ? 1 : 0;
      } else {
        data[name] = String(fd.get(name) ?? '').trim();
      }
    });
    return data;
  }

  async function saveRecord(event) {
    event.preventDefault();
    if (!currentResource) return;
    const id = Number(recordId.value || 0);
    saveButton.disabled = true;
    saveButton.textContent = 'Saving…';
    setAlert('');
    try {
      await api(currentResource, {
        method: 'POST',
        body: { resource: currentResource, action: id ? 'update' : 'create', id, data: formDataObject() }
      });
      setAlert(id ? 'Changes saved successfully.' : 'Record added successfully.', 'success');
      hideEditor();
      await loadRows();
      loadStats();
    } catch (error) {
      setAlert(error.message, 'error');
    } finally {
      saveButton.disabled = false;
      saveButton.textContent = 'Save';
    }
  }

  async function requestDelete(row) {
    let confirmed = false;
    if (typeof confirmDialog.showModal === 'function') {
      confirmDialog.showModal();
      confirmed = await new Promise((resolve) => {
        confirmDialog.addEventListener('close', () => resolve(confirmDialog.returnValue === 'confirm'), { once: true });
      });
    } else {
      confirmed = window.confirm('Delete this record? This cannot be undone.');
    }
    if (!confirmed) return;
    setAlert('');
    try {
      await api(currentResource, {
        method: 'POST',
        body: { resource: currentResource, action: 'delete', id: row.id }
      });
      setAlert('Record deleted.', 'success');
      hideEditor();
      await loadRows();
      loadStats();
    } catch (error) {
      setAlert(error.message, 'error');
    }
  }

  async function loadStats() {
    await Promise.all(Object.keys(modules).map(async (resource) => {
      try {
        const result = await api(resource);
        const target = document.getElementById(`stat-${resource}`);
        if (target) target.textContent = String((result.rows || []).length);
      } catch {
        const target = document.getElementById(`stat-${resource}`);
        if (target) target.textContent = '—';
      }
    }));
  }

  document.querySelectorAll('.nav-link').forEach((button) => {
    button.addEventListener('click', () => button.dataset.section === 'overview' ? showOverview() : openModule(button.dataset.section));
  });
  document.querySelectorAll('[data-open]').forEach((button) => button.addEventListener('click', () => openModule(button.dataset.open)));
  searchInput.addEventListener('input', renderRows);
  refreshButton.addEventListener('click', loadRows);
  newButton.addEventListener('click', newRow);
  closeEditor.addEventListener('click', hideEditor);
  cancelButton.addEventListener('click', hideEditor);
  recordForm.addEventListener('submit', saveRecord);

  logoutButton.addEventListener('click', async () => {
    logoutButton.disabled = true;
    logoutButton.textContent = 'Logging Out…';
    try {
      await fetch('/api/admin/logout', { method: 'POST', credentials: 'same-origin' });
    } finally {
      window.location.replace('/admin/login');
    }
  });

  loadSession().then((ok) => { if (ok) showOverview(); });
})();

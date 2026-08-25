(() => {
  const form = document.getElementById('login-form');
  const status = document.getElementById('status');
  const button = document.getElementById('login-button');
  const password = document.getElementById('password');
  const toggle = document.getElementById('toggle-password');

  const setStatus = (message, kind = '') => {
    status.textContent = message;
    status.className = `status ${kind}`.trim();
  };

  toggle.addEventListener('click', () => {
    const showing = password.type === 'text';
    password.type = showing ? 'password' : 'text';
    toggle.textContent = showing ? 'Show' : 'Hide';
    toggle.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setStatus('');
    const data = new FormData(form);
    button.disabled = true;
    button.textContent = 'Signing In…';

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          identity: String(data.get('identity') || '').trim(),
          password: String(data.get('password') || ''),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Sign in failed.');
      setStatus('Login successful. Opening dashboard…', 'success');
      window.location.replace('/admin/dashboard');
    } catch (error) {
      setStatus(error.message || 'Sign in failed.', 'error');
    } finally {
      button.disabled = false;
      button.textContent = 'Sign In';
    }
  });
})();

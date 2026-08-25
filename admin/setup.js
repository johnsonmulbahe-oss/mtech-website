(() => {
  const form = document.getElementById('setup-form');
  const status = document.getElementById('status');
  const button = document.getElementById('submit-button');

  function setStatus(message, kind = '') {
    status.textContent = message;
    status.className = `status ${kind}`.trim();
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setStatus('');

    const data = new FormData(form);
    const password = String(data.get('password') || '');
    const confirmPassword = String(data.get('confirmPassword') || '');

    if (password !== confirmPassword) {
      setStatus('The two admin passwords do not match.', 'error');
      return;
    }

    if (password.length < 12) {
      setStatus('Use an admin password with at least 12 characters.', 'error');
      return;
    }

    button.disabled = true;
    button.textContent = 'Creating Administrator…';

    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          fullName: String(data.get('fullName') || '').trim(),
          username: String(data.get('username') || '').trim(),
          email: String(data.get('email') || '').trim(),
          password,
          setupSecret: String(data.get('setupSecret') || ''),
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Administrator setup failed.');

      form.reset();
      setStatus('Administrator created successfully. The temporary setup page is now locked because an admin account exists.', 'success');
    } catch (error) {
      setStatus(error.message || 'Administrator setup failed.', 'error');
    } finally {
      button.disabled = false;
      button.textContent = 'Create Administrator';
    }
  });
})();

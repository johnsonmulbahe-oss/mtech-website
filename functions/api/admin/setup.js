const enc = new TextEncoder();

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...headers,
    },
  });
}

function bytesToHex(bytes) {
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function sha256Bytes(value) {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(value)));
}

async function safeSecretEqual(a, b) {
  const [ha, hb] = await Promise.all([sha256Bytes(a), sha256Bytes(b)]);
  let diff = ha.length ^ hb.length;
  const len = Math.max(ha.length, hb.length);
  for (let i = 0; i < len; i += 1) diff |= (ha[i % ha.length] || 0) ^ (hb[i % hb.length] || 0);
  return diff === 0;
}

async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iterations = 310000;
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    keyMaterial,
    256
  );
  return `pbkdf2_sha256$${iterations}$${bytesToHex(salt)}$${bytesToHex(new Uint8Array(bits))}`;
}

function validUsername(value) {
  return /^[A-Za-z0-9._-]{3,40}$/.test(value || '');
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.DB) return json({ ok: false, error: 'Database binding is unavailable.' }, 500);
  if (!env.ADMIN_SETUP_SECRET) return json({ ok: false, error: 'Admin setup secret is not configured.' }, 500);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'Invalid request.' }, 400);
  }

  const setupSecret = String(body.setupSecret || '');
  const username = String(body.username || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const fullName = String(body.fullName || '').trim();
  const password = String(body.password || '');

  if (!(await safeSecretEqual(setupSecret, String(env.ADMIN_SETUP_SECRET)))) {
    await new Promise((resolve) => setTimeout(resolve, 350));
    return json({ ok: false, error: 'Setup authorization failed.' }, 403);
  }

  const existing = await env.DB.prepare('SELECT COUNT(*) AS count FROM admin_users').first();
  if (Number(existing?.count || 0) > 0) {
    return json({ ok: false, error: 'Administrator setup is already complete.' }, 409);
  }

  if (!validUsername(username)) {
    return json({ ok: false, error: 'Username must be 3–40 characters using letters, numbers, dot, dash, or underscore.' }, 400);
  }
  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    return json({ ok: false, error: 'Enter a valid email address.' }, 400);
  }
  if (password.length < 12) {
    return json({ ok: false, error: 'Admin password must contain at least 12 characters.' }, 400);
  }

  const passwordHash = await hashPassword(password);

  try {
    await env.DB.prepare(
      `INSERT INTO admin_users (username, email, password_hash, full_name, role, is_active)
       VALUES (?, ?, ?, ?, 'admin', 1)`
    )
      .bind(username, email || null, passwordHash, fullName || null)
      .run();
  } catch (error) {
    return json({ ok: false, error: 'Could not create administrator account.' }, 500);
  }

  return json({ ok: true, message: 'Administrator account created securely.' }, 201);
}

export function onRequest() {
  return json({ ok: false, error: 'Method not allowed.' }, 405, { allow: 'POST' });
}

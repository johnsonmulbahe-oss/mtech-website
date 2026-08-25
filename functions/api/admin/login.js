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

function hexToBytes(hex) {
  if (!/^[0-9a-f]+$/i.test(hex) || hex.length % 2) return null;
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i += 1) out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

function bytesToHex(bytes) {
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function sha256Hex(value) {
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(value));
  return bytesToHex(new Uint8Array(digest));
}

async function verifyPassword(password, stored) {
  const parts = String(stored || '').split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2_sha256') return false;
  const iterations = Number(parts[1]);
  if (!Number.isInteger(iterations) || iterations < 1 || iterations > 100000) return false;
  const salt = hexToBytes(parts[2]);
  const expected = hexToBytes(parts[3]);
  if (!salt || !expected) return false;

  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    keyMaterial,
    expected.length * 8
  );
  const actual = new Uint8Array(bits);
  if (actual.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < actual.length; i += 1) diff |= actual[i] ^ expected[i];
  return diff === 0;
}

function randomToken() {
  return bytesToHex(crypto.getRandomValues(new Uint8Array(32)));
}

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ ok: false, error: 'Database binding is unavailable.' }, 500);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'Invalid request.' }, 400);
  }

  const identity = String(body.identity || '').trim().toLowerCase();
  const password = String(body.password || '');
  if (!identity || !password) return json({ ok: false, error: 'Enter your username/email and password.' }, 400);

  const user = await env.DB.prepare(
    `SELECT id, username, email, password_hash, full_name, role, is_active
     FROM admin_users
     WHERE lower(username) = ? OR lower(email) = ?
     LIMIT 1`
  ).bind(identity, identity).first();

  const valid = user && Number(user.is_active) === 1 && await verifyPassword(password, user.password_hash);
  if (!valid) {
    await new Promise((resolve) => setTimeout(resolve, 350));
    return json({ ok: false, error: 'Invalid username/email or password.' }, 401);
  }

  const token = randomToken();
  const tokenHash = await sha256Hex(token);
  await env.DB.prepare(`DELETE FROM admin_sessions WHERE expires_at <= CURRENT_TIMESTAMP`).run();
  await env.DB.prepare(
    `INSERT INTO admin_sessions (admin_user_id, session_token_hash, expires_at)
     VALUES (?, ?, datetime('now', '+8 hours'))`
  ).bind(user.id, tokenHash).run();
  await env.DB.prepare(`UPDATE admin_users SET last_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .bind(user.id).run();

  return json(
    { ok: true, user: { id: user.id, username: user.username, fullName: user.full_name, role: user.role } },
    200,
    { 'set-cookie': `mtech_admin_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800` }
  );
}

export function onRequest() {
  return json({ ok: false, error: 'Method not allowed.' }, 405, { allow: 'POST' });
}

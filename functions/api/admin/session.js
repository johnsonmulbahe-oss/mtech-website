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

async function sha256Hex(value) {
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(value));
  return bytesToHex(new Uint8Array(digest));
}

function getCookie(request, name) {
  const cookie = request.headers.get('cookie') || '';
  for (const part of cookie.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return '';
}

export async function onRequestGet({ request, env }) {
  if (!env.DB) return json({ ok: false, error: 'Database binding is unavailable.' }, 500);
  const token = getCookie(request, 'mtech_admin_session');
  if (!token) return json({ ok: false, error: 'Not authenticated.' }, 401);

  const tokenHash = await sha256Hex(token);
  const session = await env.DB.prepare(
    `SELECT s.id AS session_id, s.admin_user_id, u.username, u.email, u.full_name, u.role
     FROM admin_sessions s
     JOIN admin_users u ON u.id = s.admin_user_id
     WHERE s.session_token_hash = ?
       AND s.expires_at > CURRENT_TIMESTAMP
       AND u.is_active = 1
     LIMIT 1`
  ).bind(tokenHash).first();

  if (!session) return json({ ok: false, error: 'Session expired.' }, 401, {
    'set-cookie': 'mtech_admin_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'
  });

  await env.DB.prepare(`UPDATE admin_sessions SET last_used_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .bind(session.session_id).run();

  return json({
    ok: true,
    user: {
      id: session.admin_user_id,
      username: session.username,
      email: session.email,
      fullName: session.full_name,
      role: session.role,
    },
  });
}

export function onRequest() {
  return json({ ok: false, error: 'Method not allowed.' }, 405, { allow: 'GET' });
}

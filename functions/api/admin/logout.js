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

export async function onRequestPost({ request, env }) {
  if (env.DB) {
    const token = getCookie(request, 'mtech_admin_session');
    if (token) {
      const tokenHash = await sha256Hex(token);
      await env.DB.prepare(`DELETE FROM admin_sessions WHERE session_token_hash = ?`).bind(tokenHash).run();
    }
  }

  return json({ ok: true }, 200, {
    'set-cookie': 'mtech_admin_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'
  });
}

export function onRequest() {
  return json({ ok: false, error: 'Method not allowed.' }, 405, { allow: 'POST' });
}

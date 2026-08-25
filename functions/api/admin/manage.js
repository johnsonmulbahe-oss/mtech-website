const enc = new TextEncoder();

const RESOURCES = {
  leadership: {
    table: 'leadership',
    columns: ['name','position','location','contact','email','bio','photo_url','is_founder','display_order','is_active'],
    required: ['name','position']
  },
  services: {
    table: 'services',
    columns: ['name','short_description','full_description','icon','image_url','display_order','is_active'],
    required: ['name']
  },
  portfolio: {
    table: 'portfolio',
    columns: ['title','category','description','image_url','project_date','location','problem','solution','result','is_featured','display_order','is_active'],
    required: ['title','category']
  },
  testimonials: {
    table: 'testimonials',
    columns: ['client_name','company_name','position','testimonial','client_photo_url','rating','display_order','is_active'],
    required: ['client_name','testimonial']
  },
  messages: {
    table: 'contact_messages',
    columns: ['status','admin_notes'],
    required: [],
    readonlyCreate: true
  },
  settings: {
    table: 'site_settings',
    columns: ['setting_key','setting_value','setting_group'],
    required: ['setting_key'],
    uniqueKey: 'setting_key'
  }
};

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...headers
    }
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

async function authenticate(request, env) {
  const token = getCookie(request, 'mtech_admin_session');
  if (!token) return null;
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
  if (!session) return null;
  await env.DB.prepare('UPDATE admin_sessions SET last_used_at = CURRENT_TIMESTAMP WHERE id = ?')
    .bind(session.session_id).run();
  return session;
}

function normalizeValue(column, value) {
  if (['is_founder','is_featured','is_active','display_order','rating'].includes(column)) {
    if (value === '' || value === null || value === undefined) return column === 'is_active' ? 1 : 0;
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function cleanData(config, input = {}) {
  const data = {};
  for (const column of config.columns) {
    if (Object.prototype.hasOwnProperty.call(input, column)) {
      data[column] = normalizeValue(column, input[column]);
    }
  }
  return data;
}

function validateRequired(config, data) {
  for (const field of config.required || []) {
    if (data[field] === undefined || data[field] === null || String(data[field]).trim() === '') {
      return `Required field missing: ${field}`;
    }
  }
  return '';
}

export async function onRequestGet({ request, env }) {
  if (!env.DB) return json({ ok: false, error: 'Database binding is unavailable.' }, 500);
  const user = await authenticate(request, env);
  if (!user) return json({ ok: false, error: 'Not authenticated.' }, 401);

  const url = new URL(request.url);
  const resource = url.searchParams.get('resource') || '';
  const config = RESOURCES[resource];
  if (!config) return json({ ok: false, error: 'Unknown resource.' }, 400);

  let order = 'id DESC';
  if (resource === 'leadership' || resource === 'services' || resource === 'portfolio' || resource === 'testimonials') {
    order = 'display_order ASC, id ASC';
  } else if (resource === 'messages') {
    order = 'created_at DESC, id DESC';
  } else if (resource === 'settings') {
    order = 'setting_group ASC, setting_key ASC';
  }

  const result = await env.DB.prepare(`SELECT * FROM ${config.table} ORDER BY ${order}`).all();
  return json({ ok: true, rows: result.results || [] });
}

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ ok: false, error: 'Database binding is unavailable.' }, 500);
  const user = await authenticate(request, env);
  if (!user) return json({ ok: false, error: 'Not authenticated.' }, 401);

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: 'Invalid request body.' }, 400);
  }

  const resource = String(payload.resource || '');
  const action = String(payload.action || '');
  const config = RESOURCES[resource];
  if (!config) return json({ ok: false, error: 'Unknown resource.' }, 400);

  const id = Number(payload.id || 0);
  const data = cleanData(config, payload.data || {});

  try {
    if (action === 'create') {
      if (config.readonlyCreate) return json({ ok: false, error: 'This resource cannot be created here.' }, 405);
      const validation = validateRequired(config, data);
      if (validation) return json({ ok: false, error: validation }, 400);
      const columns = Object.keys(data);
      if (!columns.length) return json({ ok: false, error: 'No data supplied.' }, 400);
      const placeholders = columns.map(() => '?').join(',');
      const values = columns.map((c) => data[c]);
      const result = await env.DB.prepare(
        `INSERT INTO ${config.table} (${columns.join(',')}) VALUES (${placeholders})`
      ).bind(...values).run();
      return json({ ok: true, id: result.meta?.last_row_id || null });
    }

    if (action === 'update') {
      if (!id) return json({ ok: false, error: 'Missing record id.' }, 400);
      const columns = Object.keys(data);
      if (!columns.length) return json({ ok: false, error: 'No changes supplied.' }, 400);
      if (resource !== 'messages') {
        const merged = await env.DB.prepare(`SELECT * FROM ${config.table} WHERE id = ?`).bind(id).first();
        if (!merged) return json({ ok: false, error: 'Record not found.' }, 404);
        const validation = validateRequired(config, { ...merged, ...data });
        if (validation) return json({ ok: false, error: validation }, 400);
      }
      const setClause = columns.map((c) => `${c} = ?`).join(', ');
      const values = columns.map((c) => data[c]);
      await env.DB.prepare(
        `UPDATE ${config.table} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
      ).bind(...values, id).run();
      return json({ ok: true });
    }

    if (action === 'delete') {
      if (!id) return json({ ok: false, error: 'Missing record id.' }, 400);
      await env.DB.prepare(`DELETE FROM ${config.table} WHERE id = ?`).bind(id).run();
      return json({ ok: true });
    }

    return json({ ok: false, error: 'Unknown action.' }, 400);
  } catch (error) {
    const message = String(error?.message || 'Database operation failed.');
    if (message.includes('UNIQUE constraint failed')) {
      return json({ ok: false, error: 'That key or value already exists.' }, 409);
    }
    return json({ ok: false, error: message }, 500);
  }
}

export function onRequest() {
  return json({ ok: false, error: 'Method not allowed.' }, 405, { allow: 'GET, POST' });
}

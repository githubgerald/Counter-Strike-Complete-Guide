// Small wrapper for calling the site's own JSON API. Sends the CSRF token on changes.
let csrfToken = '';

export const setCsrf = (token) => { csrfToken = token || ''; };

export async function api(path, { method = 'GET', body } = {}) {
  const options = { method, credentials: 'same-origin', headers: { Accept: 'application/json' } };
  if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }
  if (method !== 'GET' && csrfToken) options.headers['X-CSRF-Token'] = csrfToken;
  let response;
  try {
    response = await fetch(`/api${path}`, options);
  } catch (_) {
    throw Object.assign(new Error('Could not reach the server. Check your connection.'), { status: 0 });
  }
  let data = null;
  try { data = await response.json(); } catch (_) { /* no body */ }
  if (!response.ok) throw Object.assign(new Error((data && data.error) || 'Something went wrong.'), { status: response.status });
  return data;
}

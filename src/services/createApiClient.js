// Cliente HTTP base compartido por las dos aplicaciones.
// No realiza peticiones hasta que el docente proporcione la configuración.
/** @param {{apiUrl: string, appToken: string}} config */
export function createApiClient(config) {
  /**
   * @param {string} path
   * @param {RequestInit & {token?: string | null, onUnauthorized?: () => void | Promise<void>, onForbidden?: () => void | Promise<void>}} [options]
   */
  return async function apiFetch(path, {
    token = null, onUnauthorized, onForbidden, headers = {}, ...options
  } = {}) {
    if (!config.apiUrl || !config.appToken) {
      throw new Error('API pendiente de configurar con los datos del docente.');
    }
    if (!path.startsWith('/') || path.startsWith('//')) {
      throw new Error('La ruta de la API debe comenzar con una sola diagonal.');
    }
    const requestHeaders = new Headers(headers);
    requestHeaders.set('Accept', 'application/json');
    requestHeaders.set('x-api-token', config.appToken);
    if (options.body != null) requestHeaders.set('Content-Type', 'application/json');
    if (token) requestHeaders.set('Authorization', `Bearer ${token}`);
    const response = await fetch(`${config.apiUrl.replace(/\/$/, '')}${path}`, {
      ...options, headers: requestHeaders,
    });
    if (response.status === 401) await onUnauthorized?.();
    if (response.status === 403) await onForbidden?.();
    if (!response.ok) {
      const error = Object.assign(new Error(`Error HTTP ${response.status}`), { status: response.status });
      throw error;
    }
    if (response.status === 204) return null;
    return response.json();
  };
}

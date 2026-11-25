/** @param {{apiUrl:string, appToken:string}} config */
export function createApiClient(config) {
  /** @param {string} path
   * @param {RequestInit & {token?:string|null,onUnauthorized?:()=>void|Promise<void>}} [options] */
  return async function request(
    path,
    { token = null, onUnauthorized, headers = {}, ...options } = {},
  ) {
    if (!config.apiUrl || !config.appToken)
      throw new Error("Falta configurar la conexión con CampusLab.");
    if (!path.startsWith("/") || path.startsWith("//"))
      throw new Error("Ruta de API inválida.");
    const controller = new AbortController();
    const abort = () => controller.abort();
    options.signal?.addEventListener("abort", abort, { once: true });
    if (options.signal?.aborted) controller.abort();
    const timeout = setTimeout(abort, 60000);
    const requestHeaders = new Headers(headers);
    requestHeaders.set("Accept", "application/json");
    requestHeaders.set("x-api-token", config.appToken);
    if (options.body != null)
      requestHeaders.set("Content-Type", "application/json");
    if (token) requestHeaders.set("Authorization", `Bearer ${token}`);
    try {
      const response = await fetch(config.apiUrl.replace(/\/$/, "") + path, {
        ...options,
        headers: requestHeaders,
        signal: controller.signal,
      });
      const data =
        response.status === 204
          ? null
          : await response.json().catch(() => null);
      if (response.status === 401 && token) await onUnauthorized?.();
      if (!response.ok) {
        const fields = Array.isArray(data?.errors)
          ? data.errors
              .map((e) => e.mensaje)
              .filter(Boolean)
              .join(" ")
          : "";
        const message =
          response.status === 403
            ? "No tienes permiso para realizar esta acción."
            : fields ||
              data?.message ||
              `No fue posible completar la solicitud (${response.status}).`;
        throw Object.assign(new Error(message), {
          status: response.status,
          code: data?.code,
        });
      }
      return data;
    } catch (error) {
      if (error.name === "AbortError")
        throw new Error("La conexión tardó demasiado. Intenta de nuevo.");
      if (error instanceof TypeError)
        throw new Error(
          "No fue posible conectar con el servidor. Revisa tu conexión e intenta de nuevo.",
        );
      throw error;
    } finally {
      clearTimeout(timeout);
      options.signal?.removeEventListener("abort", abort);
    }
  };
}

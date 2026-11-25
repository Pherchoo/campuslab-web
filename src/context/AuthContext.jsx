import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "../services/api";
import { sessionStorage } from "../services/sessionStorage";
import { AuthContext as Context } from "./AuthState";
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null),
    [status, setStatus] = useState("loading"),
    [error, setError] = useState("");
  const current = useRef(null),
    generation = useRef(0);
  const logout = useCallback(async () => {
    generation.current++;
    current.current = null;
    setSession(null);
    setStatus("ready");
    setError("");
    try {
      await sessionStorage.remove();
    } catch {
      setError(
        "No pudimos borrar el acceso guardado. Cierra esta ventana si compartes el equipo.",
      );
    }
  }, []);
  const restore = useCallback(async () => {
    const version = ++generation.current;
    await Promise.resolve();
    if (version !== generation.current) return;
    setStatus("loading");
    setError("");
    try {
      const token = await sessionStorage.get();
      if (version !== generation.current) return;
      if (!token) {
        setStatus("ready");
        return;
      }
      current.current = token;
      const { user } = await apiFetch("/api/auth/me", {
        token,
        onUnauthorized: logout,
      });
      if (version !== generation.current) return;
      setSession({ token, user });
      setStatus("ready");
    } catch (e) {
      if (version !== generation.current) return;
      setError(e.message);
      setStatus("restore-error");
    }
  }, [logout]);
  const invalidate = useCallback(() => {
    generation.current++;
  }, []);
  useEffect(() => {
    let disposed = false;
    Promise.resolve().then(() => {
      if (!disposed) void restore();
    });
    return () => {
      disposed = true;
      invalidate();
    };
  }, [restore, invalidate]);
  const login = async (email, password) => {
    const data = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    });
    await sessionStorage.set(data.token);
    generation.current++;
    current.current = data.token;
    setError("");
    setSession(data);
    setStatus("ready");
  };
  const request = useCallback(
    (path, options = {}) => {
      const token = current.current;
      return apiFetch(path, {
        ...options,
        token,
        onUnauthorized: () =>
          current.current === token ? logout() : undefined,
      });
    },
    [logout],
  );
  const register = (values) =>
    apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        nombre: values.nombre.trim(),
        matricula: values.matricula.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
      }),
    });
  return (
    <Context.Provider
      value={{
        session,
        status,
        error,
        login,
        logout,
        register,
        request,
        restore,
      }}
    >
      {children}
    </Context.Provider>
  );
}

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  Link,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthState";
import { LabsProvider } from "./context/LabsContext";
import AuthPage from "./pages/AuthPage";
import Laboratories from "./pages/Laboratories";
import MySession from "./pages/MySession";
import Shell from "./components/Shell";
import { Loading, Alert } from "./components/Feedback";
function Guard({ guest = false }) {
  const { session, status, error, restore, logout } = useAuth();
  if (status === "loading") return <Loading />;
  if (status === "restore-error")
    return (
      <div className="center-state">
        <h1>No pudimos recuperar tu sesión</h1>
        <Alert>{error}</Alert>
        <div className="session-actions">
          <button className="btn primary" onClick={restore}>
            Reintentar
          </button>
          <button className="btn" onClick={logout}>
            Volver al acceso
          </button>
        </div>
      </div>
    );
  if (guest)
    return session ? <Navigate to="/laboratorios" replace /> : <Outlet />;
  return session ? (
    <LabsProvider>
      <Shell />
    </LabsProvider>
  ) : (
    <Navigate to="/login" replace />
  );
}
function Missing() {
  return (
    <section className="panel empty">
      <h1>Página no encontrada</h1>
      <p className="muted">Vuelve a tu espacio para continuar.</p>
      <Link to="/laboratorios" className="btn primary">
        Ir a laboratorios
      </Link>
    </section>
  );
}
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Guard guest />}>
            <Route path="/login" element={<AuthPage key="login" />} />
            <Route
              path="/registro"
              element={<AuthPage key="registro" register />}
            />
          </Route>
          <Route element={<Guard />}>
            <Route path="/laboratorios" element={<Laboratories />} />
            <Route path="/mi-sesion" element={<MySession />} />
            <Route path="*" element={<Missing />} />
          </Route>
          <Route path="/" element={<Navigate to="/laboratorios" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthState";
import { validateAccount } from "../utils/domain";
import Icon from "../components/Icon";
import { Alert } from "../components/Feedback";

export default function AuthPage({ register = false }) {
  const { login, register: createAccount, error: sessionError } = useAuth(),
    navigate = useNavigate(),
    location = useLocation();
  const [values, setValues] = useState({
      nombre: "",
      matricula: "",
      email: "",
      password: "",
      confirm: "",
    }),
    [visible, setVisible] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const handleChange = (e) => {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
    setError("");
  };
  async function handleSubmit(e) {
    e.preventDefault();
    if (busy) return;
    const message = validateAccount(values, register);
    if (message) {
      setError(message);
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (register) {
        await createAccount(values);
        navigate("/login", {
          replace: true,
          state: {
            message: "Tu cuenta está lista. Inicia sesión para continuar.",
          },
        });
      } else {
        await login(values.email, values.password);
        navigate("/laboratorios", { replace: true });
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  function field(
    name,
    label,
    placeholder,
    type = "text",
    autoComplete = "off",
  ) {
    const password = type === "password";
    return (
      <div className="form-group">
        <label htmlFor={name}>{label}</label>
        <div className="input-wrapper">
          <input
            id={name}
            name={name}
            type={password && visible ? "text" : type}
            className="form-control"
            placeholder={placeholder}
            value={values[name]}
            onChange={handleChange}
            autoComplete={autoComplete}
            disabled={busy}
            autoCapitalize={type === "email" ? "none" : undefined}
            required
            minLength={register && password ? 6 : undefined}
          />
          {password && name === "password" && (
            <button
              type="button"
              className="toggle-password"
              aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
              aria-pressed={visible}
              onClick={() => setVisible(!visible)}
            >
              <Icon name="eye" />
            </button>
          )}
        </div>
      </div>
    );
  }
  return (
    <section id="auth-screen">
      <div className="auth-container">
        <div className="auth-banner">
          <div className="banner-content">
            <div className="banner-logo">
              <div className="logo-icon">
                <Icon name="monitor" />
              </div>
              CampusLab
            </div>
            <div className="banner-text">
              Gestiona,
              <br />
              asigna y monitorea
              <br />
              <span>tus laboratorios</span>
              <br />
              en un solo panel.
            </div>
          </div>
        </div>
        <div className="auth-form-wrapper">
          <div className="auth-mobile-brand">
            <Icon name="monitor" />
            <span>CampusLab</span>
          </div>
          <div
            id={register ? "register-view" : "login-view"}
            className="auth-view active"
          >
            <div className="auth-header">
              <h1>{register ? "Crear cuenta" : "Bienvenido de nuevo"}</h1>
              <p>
                {register
                  ? "Regístrate para comenzar a usar los laboratorios."
                  : "Ingresa tus credenciales para acceder al panel."}
              </p>
            </div>
            {!register && <Alert success>{location.state?.message}</Alert>}
            <Alert>{error || sessionError}</Alert>
            <form onSubmit={handleSubmit} aria-busy={busy}>
              {register && (
                <>
                  {field(
                    "nombre",
                    "Nombre completo",
                    "Tu nombre completo",
                    "text",
                    "name",
                  )}
                  {field(
                    "matricula",
                    "Matrícula",
                    "Tu matrícula",
                    "text",
                    "off",
                  )}
                </>
              )}
              {field(
                "email",
                "Correo electrónico",
                "tu@correo.edu",
                "email",
                "email",
              )}
              {field(
                "password",
                "Contraseña",
                register ? "Mínimo 6 caracteres" : "••••••••",
                "password",
                register ? "new-password" : "current-password",
              )}
              {register &&
                field(
                  "confirm",
                  "Confirmar contraseña",
                  "Repite tu contraseña",
                  "password",
                  "new-password",
                )}
              <button className="Btn-submit" disabled={busy}>
                {busy
                  ? "Un momento…"
                  : register
                    ? "Crear cuenta"
                    : "Iniciar sesión"}
                {!busy && <Icon name="arrow" />}
              </button>
            </form>
            <div className="auth-footer">
              {register ? "¿Ya tienes una cuenta? " : "¿No tienes cuenta? "}
              <Link to={register ? "/login" : "/registro"}>
                {register ? "Iniciar sesión" : "Crear una cuenta"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

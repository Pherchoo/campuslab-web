import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthState";
import { initials } from "../utils/domain";
import Icon from "./Icon";
import Modal from "./Modal";
export default function Shell() {
  const { session, logout } = useAuth(),
    [menuPath, setMenuPath] = useState(null),
    [help, setHelp] = useState(false),
    location = useLocation(),
    sidebar = useRef(null),
    toggle = useRef(null);
  const menu = menuPath === location.pathname;
  function setMenu(open) {
    setMenuPath(open ? location.pathname : null);
  }
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  useEffect(() => {
    document.body.classList.toggle("menu-open", menu);
    if (menu) sidebar.current.querySelector("button").focus();
    return () => document.body.classList.remove("menu-open");
  }, [menu]);
  useEffect(() => {
    const query = window.matchMedia("(min-width:801px)");
    const handleResize = () => {
      if (query.matches) setMenuPath(null);
    };
    query.addEventListener("change", handleResize);
    return () => query.removeEventListener("change", handleResize);
  }, []);
  function closeMenu() {
    setMenu(false);
    toggle.current?.focus();
  }
  function keydown(e) {
    if (!menu) return;
    if (e.key === "Escape") {
      e.preventDefault();
      closeMenu();
    }
    if (e.key === "Tab") {
      const els = [
        ...sidebar.current.querySelectorAll("a[href],button"),
      ].filter((el) => el.getClientRects().length);
      if (e.shiftKey && document.activeElement === els[0]) {
        e.preventDefault();
        els.at(-1).focus();
      } else if (!e.shiftKey && document.activeElement === els.at(-1)) {
        e.preventDefault();
        els[0].focus();
      }
    }
  }
  return (
    <section id="app-screen">
      <header className="mobile-header" inert={menu || undefined}>
        <Link to="/laboratorios" className="mobile-logo">
          <span className="logo-dot" />
          CampusLab
        </Link>
        <button
          ref={toggle}
          className="mobile-menu-btn"
          aria-label="Abrir menú"
          aria-expanded={menu}
          aria-controls="main-sidebar"
          onClick={() => setMenu(true)}
        >
          <Icon name="menu" />
        </button>
      </header>
      {menu && (
        <button
          className="nav-scrim"
          tabIndex={-1}
          aria-label="Cerrar menú"
          onClick={closeMenu}
        />
      )}
      <aside
        ref={sidebar}
        id="main-sidebar"
        className="sidebar"
        aria-label="Menú de CampusLab"
        role={menu ? "dialog" : undefined}
        aria-modal={menu || undefined}
        onKeyDown={keydown}
      >
        <button
          className="drawer-close mobile-menu-btn"
          aria-label="Cerrar menú"
          onClick={closeMenu}
        >
          <Icon name="close" />
        </button>
        <div className="logo">
          <span className="logo-dot" />
          CampusLab
        </div>
        <nav aria-label="Navegación principal">
          <div className="nav-section">Espacio de trabajo</div>
          <NavLink
            className="nav-item"
            to="/laboratorios"
            onClick={() => setMenu(false)}
          >
            <Icon name="monitor" />
            Laboratorios
          </NavLink>
          <NavLink
            className="nav-item"
            to="/mi-sesion"
            onClick={() => setMenu(false)}
          >
            <Icon name="clock" />
            Mi sesión activa
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <button
            className="help-block text-link"
            onClick={() => {
              setMenu(false);
              setHelp(true);
            }}
          >
            <Icon name="help" />
            Ayuda y soporte
          </button>
          <div className="user-block">
            <div className="user-info-wrapper">
              <div className="user-avatar-small">
                {initials(session.user.nombre)}
              </div>
              <div className="user-info-mini">
                {session.user.nombre}
                <span>
                  {session.user.rol === "ADMIN"
                    ? "Administrador"
                    : "Estudiante"}
                </span>
              </div>
            </div>
            <button
              className="logout-btn"
              aria-label="Cerrar sesión"
              onClick={logout}
            >
              <Icon name="logout" />
            </button>
          </div>
        </div>
      </aside>
      <main className="main-content" inert={menu || undefined}>
        <div className="content-area">
          <Outlet />
          <footer className="footer-info">
            <span>CampusLab · Universidad Tecnológica El Retoño</span>
            <span>Control de laboratorios</span>
          </footer>
        </div>
      </main>
      {help && (
        <Modal title="Ayuda y soporte" onClose={() => setHelp(false)}>
          <p className="muted">
            Selecciona un laboratorio y una estación disponible. Indica tu
            materia y las horas de uso. Al terminar, entra en Mi sesión activa
            para liberar el equipo.
          </p>
          <div className="notice">
            Si encuentras una falla, marca “Reportar una falla” al liberar tu
            estación y describe el problema.
          </div>
        </Modal>
      )}
    </section>
  );
}

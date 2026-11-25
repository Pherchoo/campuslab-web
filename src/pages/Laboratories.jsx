import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLabs } from "../context/LabsState";
import { statuses } from "../utils/domain";
import Icon from "../components/Icon";
import { Alert, Loading } from "../components/Feedback";
import AssignmentModal from "../components/AssignmentModal";

export default function Laboratories() {
  const { computers, labs, loading, refreshing, error, refresh, active } =
      useLabs(),
    navigate = useNavigate(),
    [selected, setSelected] = useState(""),
    [filter, setFilter] = useState("all"),
    [computer, setComputer] = useState(null);
  if (loading) return <Loading text="Consultando laboratorios…" />;
  const lab = labs.includes(selected) ? selected : labs[0],
    list = computers.filter((c) => c.laboratorio === lab),
    shown = list.filter((c) => filter === "all" || c.estatus === filter);
  return (
    <>
      <header className="page-header">
        <div>
          <h1>Control de Laboratorios</h1>
          <p>
            Consulta la disponibilidad y asigna una estación para tu próxima
            clase.
          </p>
        </div>
        <div className="tabs" aria-label="Laboratorio">
          {labs.map((l) => (
            <button
              key={l}
              className={`tab ${lab === l ? "active" : ""}`}
              aria-pressed={lab === l}
              onClick={() => {
                setSelected(l);
                setFilter("all");
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </header>
      <Alert>
        {error && (
          <>
            <p>{error}</p>
            <button
              className="text-link"
              onClick={refresh}
              disabled={refreshing}
            >
              Reintentar
            </button>
          </>
        )}
      </Alert>
      <div className="stats-grid">
        {[
          ["all", "Estaciones totales", ""],
          ["DISPONIBLE", "Disponibles", "available"],
          ["OCUPADA", "Ocupadas", "occupied"],
          ["MANTENIMIENTO", "En mantenimiento", "maintenance"],
        ].map(([s, label, cl]) => (
          <div className={`stat-card ${cl}`} key={s}>
            <div className="stat-value">
              {s === "all"
                ? list.length
                : list.filter((c) => c.estatus === s).length}
            </div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>
      {active && (
        <div className="notice session-notice">
          Ya tienes una estación asignada.{" "}
          <button className="text-link" onClick={() => navigate("/mi-sesion")}>
            Ver mi sesión activa
          </button>
        </div>
      )}
      <div className="section-header">
        <h2>Estaciones</h2>
        <div className="toolbar">
          <select
            className="btn"
            aria-label="Filtrar estaciones"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Todos los estados</option>
            <option value="DISPONIBLE">Disponibles</option>
            <option value="OCUPADA">Ocupadas</option>
            <option value="MANTENIMIENTO">Mantenimiento</option>
          </select>
          <button
            className="btn refresh-btn"
            onClick={refresh}
            disabled={refreshing}
            aria-label="Actualizar disponibilidad"
          >
            <Icon name="refresh" />
            {refreshing ? "Actualizando…" : "Actualizar"}
          </button>
        </div>
      </div>
      <div className="cards-grid">
        {shown.map((c) => (
          <article
            key={c.id}
            className={`card ${c.estatus === "OCUPADA" ? "occupied" : c.estatus === "MANTENIMIENTO" ? "maintenance" : ""}`}
          >
            <div className="card__header">
              <h3 className="card__title">{c.numeroInventario}</h3>
              <div className="card__icon">
                <Icon name="monitor" />
              </div>
            </div>
            <div className="card__content">
              {c.especificaciones.split(",").map((spec, i) => (
                <span className="chip" key={i}>
                  {spec.trim()}
                </span>
              ))}
              <span
                className={`status-text ${c.estatus === "DISPONIBLE" ? "available" : c.estatus === "OCUPADA" ? "occupied" : "maintenance"}`}
              >
                <span className="status-dot" />
                {statuses[c.estatus] || c.estatus}
              </span>
            </div>
            <button
              className="Btn"
              disabled={c.estatus !== "DISPONIBLE" || Boolean(active)}
              onClick={() => setComputer(c)}
            >
              {c.estatus === "DISPONIBLE"
                ? active
                  ? "Ya tienes una sesión"
                  : "Asignar"
                : c.estatus === "OCUPADA"
                  ? "No disponible"
                  : "En revisión"}
            </button>
          </article>
        ))}
        {!shown.length && (
          <p className="panel muted no-results">
            {error
              ? "No pudimos cargar las estaciones. Intenta actualizar."
              : "No hay estaciones con este estado."}
          </p>
        )}
      </div>
      <p className="form-note">
        Mostrando {shown.length} de {list.length} estaciones
        {lab ? ` de ${lab}` : ""}.
      </p>
      {computer && (
        <AssignmentModal
          computer={computer}
          onClose={() => setComputer(null)}
        />
      )}
    </>
  );
}

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthState";
import { useLabs } from "../context/LabsState";
import { dateTime } from "../utils/domain";
import Icon from "../components/Icon";
import { Alert, Loading } from "../components/Feedback";
import AssignmentModal from "../components/AssignmentModal";
export default function MySession() {
  const { session } = useAuth(),
    { active, computers, loading, error, refresh, refreshing } = useLabs(),
    [release, setRelease] = useState(false),
    location = useLocation();
  if (loading) return <Loading text="Consultando tu sesión…" />;
  const pc = computers.find((c) => c.id === active?.computerId);
  return (
    <>
      <header className="page-header">
        <div>
          <h1>Mi sesión activa</h1>
          <p>Consulta tu estación asignada y libérala al terminar.</p>
        </div>
        <button className="btn" onClick={refresh} disabled={refreshing}>
          <Icon name="refresh" />
          {refreshing ? "Actualizando…" : "Actualizar"}
        </button>
      </header>
      <Alert>{error}</Alert>
      <Alert success>{location.state?.message}</Alert>
      {active ? (
        <div className="split-layout">
          <section className="panel">
            <div className="panel-head">
              <h2>Tu estación</h2>
              <span className="badge blue">Sesión activa</span>
            </div>
            <div className="device-hero">
              <Icon name="monitor" />
              <div>
                <h2>{active.pc}</h2>
                <p className="muted">
                  {active.laboratorio} · {active.especificaciones}
                </p>
              </div>
            </div>
            <dl className="details">
              {[
                ["Estudiante", session.user.nombre],
                ["Matrícula", session.user.matricula],
                ["Materia", active.materia],
                ["Horas de uso", `${active.horasUso} h`],
                ["Inicio", dateTime(active.inicio)],
                ["Fin estimado", dateTime(active.finEstimado)],
              ].map(([title, value]) => (
                <div key={title}>
                  <dt>{title}</dt>
                  <dd>{value || "—"}</dd>
                </div>
              ))}
            </dl>
            {pc?.perifericosIncluidos?.length > 0 && (
              <>
                <p className="eyebrow">Periféricos incluidos</p>
                <div className="peripherals">
                  {pc.perifericosIncluidos.map((p) => (
                    <span className="chip" key={p}>
                      {p}
                    </span>
                  ))}
                </div>
              </>
            )}
            <div className="form-bottom">
              <button className="btn primary" onClick={() => setRelease(true)}>
                Liberar equipo
              </button>
            </div>
          </section>
          <aside className="panel">
            <h2>Cuida tu espacio</h2>
            <ul className="hint-list">
              <li>
                <strong>Al terminar tu clase</strong>Cierra tus archivos y
                libera la estación desde aquí.
              </li>
              <li>
                <strong>¿Encontraste una falla?</strong>Puedes reportarla al
                liberar tu equipo.
              </li>
              <li>
                <strong>Una estación a la vez</strong>Libera tu sesión antes de
                solicitar otra computadora.
              </li>
            </ul>
          </aside>
        </div>
      ) : (
        <section className="panel empty">
          <Icon name="monitor" />
          <h2>Todavía no tienes un equipo asignado</h2>
          <p className="muted">
            Explora los laboratorios y elige una estación disponible.
          </p>
          <Link className="btn primary" to="/laboratorios">
            Explorar laboratorios
            <Icon name="arrow" />
          </Link>
        </section>
      )}
      {release && active && (
        <AssignmentModal
          assignment={active}
          onClose={() => setRelease(false)}
        />
      )}
    </>
  );
}

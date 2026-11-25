import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLabs } from "../context/LabsState";
import { validateAssignment, validateRelease } from "../utils/domain";
import Modal from "./Modal";
import Icon from "./Icon";
import { Alert } from "./Feedback";
export default function AssignmentModal({
  computer = null,
  assignment = null,
  onClose,
}) {
  const { assign, release, refresh } = useLabs(),
    navigate = useNavigate(),
    [materia, setMateria] = useState(""),
    [hours, setHours] = useState("2"),
    [fault, setFault] = useState(false),
    [description, setDescription] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const releasing = Boolean(assignment),
    formId = "equipment-form";
  async function handleSubmit(e) {
    e.preventDefault();
    if (busy) return;
    const msg = releasing
      ? validateRelease(fault, description)
      : validateAssignment(materia, hours);
    if (msg) {
      setError(msg);
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (releasing) await release(assignment.assignmentId, fault, description);
      else await assign(computer.id, materia, hours);
      onClose();
      navigate("/mi-sesion", {
        replace: true,
        state: {
          message: releasing
            ? "La estación se liberó correctamente."
            : "Tu estación está lista. Al terminar, recuerda liberarla.",
        },
      });
    } catch (e) {
      setError(e.message);
      if (e.status === 409) void refresh();
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title={releasing ? "Liberar equipo" : "Asignar estación"}
      onClose={onClose}
      busy={busy}
      formId={formId}
      footer={
        <button
          className="btn primary"
          type="submit"
          form={formId}
          disabled={busy}
        >
          {busy
            ? "Guardando…"
            : releasing
              ? "Liberar equipo"
              : "Confirmar asignación"}
        </button>
      }
    >
      <form id={formId} onSubmit={handleSubmit} aria-busy={busy}>
        <div className="device-hero">
          <Icon name="monitor" />
          <div>
            <strong>{assignment?.pc || computer?.numeroInventario}</strong>
            <p className="muted">
              {assignment?.laboratorio || computer?.laboratorio}
            </p>
          </div>
        </div>
        <Alert>{error}</Alert>
        {releasing ? (
          <>
            <p className="muted" style={{ marginBottom: 20 }}>
              ¿Terminaste de usar tu estación? Confirma para dejarla disponible.
            </p>
            <label className="checkline">
              <input
                type="checkbox"
                checked={fault}
                onChange={(e) => setFault(e.target.checked)}
                disabled={busy}
              />
              Reportar una falla en el equipo
            </label>
            {fault && (
              <div className="field">
                <label htmlFor="fault-description">
                  Descripción de la falla
                </label>
                <textarea
                  id="fault-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe qué ocurrió con el equipo"
                  required
                  minLength={5}
                  disabled={busy}
                />
              </div>
            )}
          </>
        ) : (
          <>
            <div className="field">
              <label htmlFor="materia">Materia</label>
              <input
                id="materia"
                value={materia}
                onChange={(e) => setMateria(e.target.value)}
                placeholder="Ej. Desarrollo Web"
                required
                disabled={busy}
              />
            </div>
            <div className="field">
              <label htmlFor="hours">Horas de uso</label>
              <input
                id="hours"
                type="number"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                min="0.5"
                max="12"
                step="any"
                required
                disabled={busy}
              />
            </div>
            <p className="form-note">
              Puedes reservar entre 0.5 y 12 horas. La estación quedará asignada
              a tu cuenta.
            </p>
          </>
        )}
      </form>
    </Modal>
  );
}

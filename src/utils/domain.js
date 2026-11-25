export const statuses = {
  DISPONIBLE: "Disponible",
  OCUPADA: "En uso · Sesión activa",
  MANTENIMIENTO: "Revisión técnica",
};
export function validateAccount(values, register = false) {
  if (register && !values.nombre.trim()) return "Escribe tu nombre completo.";
  if (register && !values.matricula.trim()) return "Escribe tu matrícula.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
    return "Escribe un correo electrónico válido.";
  if (!values.password) return "Escribe tu contraseña.";
  if (register && values.password.length < 6)
    return "La contraseña debe tener al menos 6 caracteres.";
  if (register && values.password !== values.confirm)
    return "Las contraseñas no coinciden.";
  return "";
}
export function validateAssignment(materia, horas) {
  if (!materia.trim()) return "Escribe la materia que cursarás.";
  const hours = Number(horas);
  return !Number.isFinite(hours) || hours < 0.5 || hours > 12
    ? "Las horas de uso deben estar entre 0.5 y 12."
    : "";
}
export function validateRelease(report, description) {
  return report && description.trim().length < 5
    ? "Describe la falla con al menos 5 caracteres."
    : "";
}
export function ownAssignment(assignments, userId) {
  return (
    assignments.find((a) => a.estatus === "ASIGNADA" && a.userId === userId) ||
    null
  );
}
export function initials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();
}
export function dateTime(value) {
  return value
    ? new Date(value).toLocaleString("es-MX", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";
}

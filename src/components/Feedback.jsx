export function Alert({ children, success = false }) {
  return children ? (
    <div
      className={`alert${success ? " success" : ""}`}
      role={success ? "status" : "alert"}
    >
      {children}
    </div>
  ) : null;
}
export function Loading({ text = "Cargando tu espacio…" }) {
  return (
    <div className="center-state" role="status">
      <span className="spinner" />
      <p className="muted">{text}</p>
    </div>
  );
}

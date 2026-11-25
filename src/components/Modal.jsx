import { useEffect, useRef } from "react";
import Icon from "./Icon";
export default function Modal({
  title,
  children,
  footer,
  onClose,
  busy = false,
  formId,
}) {
  const ref = useRef(null),
    closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    const previous = document.activeElement;
    ref.current.showModal();
    return () => {
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby="modal-title"
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) closeRef.current();
      }}
      onClick={(e) => {
        if (e.target === ref.current && !busy) {
          const r = ref.current.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            onClose();
        }
      }}
    >
      <div id="modal-content">
        <div className="modal-head">
          <h2 id="modal-title">{title}</h2>
          <button
            className="close"
            aria-label="Cerrar diálogo"
            onClick={onClose}
            disabled={busy}
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-footer">
          <button
            className="btn"
            type="button"
            onClick={onClose}
            disabled={busy}
          >
            {formId ? "Cancelar" : "Cerrar"}
          </button>
          {footer}
        </div>
      </div>
    </dialog>
  );
}

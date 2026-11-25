import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ title, onClose, children, footer }) {
  useEffect(() => {
    const onKeyDown = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="modal" role="dialog" aria-modal="true" aria-label={title}>
      <header className="modal-header"><div><span className="eyebrow">ASSET MANAGEMENT</span><h2>{title}</h2></div>
        <button className="icon-button" onClick={onClose} aria-label="Close"><X size={18} /></button>
      </header>
      <div className="modal-body">{children}</div>
      {footer && <footer className="modal-footer">{footer}</footer>}
    </section>
  </div>;
}

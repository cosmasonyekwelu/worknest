import { X } from "lucide-react";
import { useEffect, useRef } from "react";

export default function Modal({
  id,
  title,
  children,
  isOpen,
  onClose,
  classname,
  showClose = false,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!dialogRef.current) return;

    if (isOpen && !dialogRef.current.open) {
      dialogRef.current.showModal();
    }

    if (!isOpen && dialogRef.current.open) {
      dialogRef.current.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      id={id}
      className="modal"
      onClose={onClose}
    >
      <div
        className={`modal-box ${classname}`}
        onClick={(e) => e.stopPropagation()}
      >
        {showClose && (
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 z-30"
            type="button"
            onClick={onClose}
          >
            <X/>
          </button>
        )}

        {title && <h1 className="font-bold text-lg">{title}</h1>}
        {children}
      </div>

      <form method="dialog" className="modal-backdrop bg-black/60">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}

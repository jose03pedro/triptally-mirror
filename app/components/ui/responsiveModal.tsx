"use client";

import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ResponsiveModalProps {
  id: string;
  title: string;
  action: any;            // server action from useActionState
  children: ReactNode;
  isPending?: boolean;
  canSubmit?: boolean;
  onCancel?: () => void;  // called when Close/Cancel is pressed
  showFooter?: boolean;   // <--- Add this prop
}

export default function ResponsiveModal({
  id,
  title,
  action,
  children,
  isPending = false,
  canSubmit = true,
  onCancel,
  showFooter = true,
}: ResponsiveModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Prevent background scrolling when modal is open
    document.body.classList.add("modal-open");
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, []);

  // Don't render anything on the server or before mounting
  if (!mounted) return null;

  // Render the modal into document.body using a Portal
  return createPortal(
    <>
      {/* Backdrop */}
      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }} />

      {/* Modal */}
      <div
        className="modal show d-block"
        id={`${id}Modal`}
        role="dialog"
        aria-labelledby={`${id}ModalLabel`}
        aria-modal="true"
        style={{ zIndex: 1055 }}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content shadow">
            <div className="modal-header">
              <h5 className="modal-title fs-6" id={`${id}ModalLabel`}>
                {title}
              </h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onCancel}
              />
            </div>

            <form id={`${id}ModalForm`} action={action}>
              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {children}
              </div>

              {/* Conditionally render the footer */}
              {showFooter && (
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={onCancel}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isPending || !canSubmit}
                  >
                    {isPending ? "Saving..." : "Save"}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
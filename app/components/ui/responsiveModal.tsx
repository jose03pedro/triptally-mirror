"use client";

import { ReactNode } from "react";

interface ResponsiveModalProps {
  id: string;
  title: string;
  action: any;            // server action from useActionState
  children: ReactNode;
  isPending?: boolean;
  canSubmit?: boolean;
  onCancel?: () => void;  // called when Close/Cancel is pressed
}

export default function ResponsiveModal({
  id,
  title,
  action,
  children,
  isPending = false,
  canSubmit = true,
  onCancel,
}: ResponsiveModalProps) {
  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop fade show" />

      {/* Modal */}
      <div
        className="modal show d-block"
        id={`${id}Modal`}
        role="dialog"
        aria-labelledby={`${id}ModalLabel`}
        aria-modal="true"
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
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
              <div className="modal-body">{children}</div>

              <div className="modal-footer">
                <button type="button" className="btn" onClick={onCancel}>
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
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
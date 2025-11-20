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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
          onClick={onCancel}
      />

      {/* Modal Content */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-labelledby={`${id}ModalLabel`}
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50/50">
          <h3 className="font-semibold text-slate-900" id={`${id}ModalLabel`}>
            {title}
          </h3>
          <button
            type="button"
            className="text-slate-400 hover:text-slate-600 transition rounded-full p-1 hover:bg-slate-100 flex items-center justify-center"
            aria-label="Close"
            onClick={onCancel}
          >
             <span className="material-icons text-xl">close</span>
          </button>
        </div>

        <form action={action} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {children}
          </div>

          <div className="border-t border-slate-100 px-4 py-3 bg-slate-50/50 flex justify-end gap-2">
            <button 
                type="button" 
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition" 
                onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              disabled={isPending || !canSubmit}
            >
              {isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

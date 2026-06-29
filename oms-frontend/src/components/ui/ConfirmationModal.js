"use client";

import { useEffect } from "react";

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  onConfirm,
  onClose,
}) {
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape" && !isLoading) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
      <div className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-[0_20px_60px_rgba(42,12,56,0.18)]">
        <div>
          <p className="text-sm font-medium text-[#8e3bb9]">Confirmation</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">{title}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">{message}</p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            style={{ cursor: isLoading ? "not-allowed" : "pointer" }}
            className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition duration-200 hover:bg-slate-50 active:scale-[0.99] disabled:opacity-70"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            style={{ cursor: isLoading ? "not-allowed" : "pointer" }}
            className="flex items-center justify-center gap-2 rounded-lg bg-linear-to-r from-[#2b0a38] to-[#7a1e9f] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(122,30,159,0.22)] transition duration-200 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:scale-[0.99] disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                <span>Processing...</span>
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

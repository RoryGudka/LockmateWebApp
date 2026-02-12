import React, { createContext, useContext, useMemo, useState } from "react";

export type ToastTone = "success" | "error" | "info";

type Toast = {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
  durationMs: number;
};

type ToastContextValue = {
  showToast: (toast: {
    title: string;
    description?: string;
    tone?: ToastTone;
    durationMs?: number;
  }) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (toast: {
    title: string;
    description?: string;
    tone?: ToastTone;
    durationMs?: number;
  }) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const tone = toast.tone ?? "info";
    const durationMs = toast.durationMs ?? 2500;
    setToasts((prev) => [
      ...prev,
      { id, title: toast.title, description: toast.description, tone, durationMs },
    ]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, durationMs);
  };

  const value = useMemo(() => ({ showToast }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 16,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          padding: "0 16px",
          zIndex: 1000,
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            style={{
              width: "100%",
              maxWidth: 420,
              borderRadius: 12,
              padding: "12px 14px",
              background:
                toast.tone === "success"
                  ? "#e8f9f1"
                  : toast.tone === "error"
                  ? "#faeeee"
                  : "#f2f2f6",
              color:
                toast.tone === "success"
                  ? "#00c306"
                  : toast.tone === "error"
                  ? "#f70f0f"
                  : "#212427",
              boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: toast.description ? 4 : 0 }}>
              {toast.title}
            </div>
            {toast.description ? (
              <div style={{ fontSize: 14 }}>{toast.description}</div>
            ) : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
};

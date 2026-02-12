interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  showCancel = true,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "white",
          borderRadius: "16px",
          padding: "20px",
          boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
          textAlign: "left",
        }}
      >
        <h3 style={{ margin: 0, marginBottom: "8px", fontSize: "20px" }}>
          {title}
        </h3>
        <p style={{ margin: 0, marginBottom: "16px", fontSize: "15px" }}>
          {message}
        </p>
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "flex-end",
          }}
        >
          {showCancel ? (
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: "8px 14px",
                borderRadius: "10px",
                border: "1px solid #d4d4d8",
                background: "white",
                cursor: "pointer",
              }}
            >
              {cancelText}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: "8px 14px",
              borderRadius: "10px",
              border: "none",
              background: "#6c9ef9",
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;

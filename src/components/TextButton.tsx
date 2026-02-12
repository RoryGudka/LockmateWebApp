import LoadingSpinner from "./LoadingSpinner";
import { palette } from "../theme";
import { useState } from "react";

interface ContainerProps {
  text: string;
  onClick: () => any;
  disabled?: boolean;
  variant?: "text" | "contained";
}

const TextButton: React.FC<ContainerProps> = ({
  text,
  onClick,
  disabled,
  variant = "text",
}) => {
  const [processing, setProcessing] = useState(false);

  const handleClick = async () => {
    if (processing || disabled) return;
    setProcessing(true);
    await onClick();
    setProcessing(false);
  };

  return (
    <button
      type="button"
      disabled={disabled || processing}
      style={{
        display: "inline-flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "8px",
        background:
          variant === "contained" ? palette.blue.main : "transparent",
        border: variant === "contained" ? "none" : "none",
        padding: variant === "contained" ? "10px 16px" : 0,
        color: variant === "contained" ? "white" : palette.blue.main,
        cursor: disabled || processing ? "not-allowed" : "pointer",
        borderRadius: variant === "contained" ? "10px" : 0,
        fontWeight: variant === "contained" ? 600 : 500,
        boxShadow:
          variant === "contained" ? "0 2px 4px rgba(0,0,0,0.12)" : "none",
        margin: variant === "contained" ? "0 auto" : 0,
        width: variant === "contained" ? "100%" : "auto",
        maxWidth: variant === "contained" ? "100%" : "none",
      }}
      onClick={handleClick}
    >
      <span>{text}</span>
      {processing ? <LoadingSpinner /> : null}
    </button>
  );
};

export default TextButton;

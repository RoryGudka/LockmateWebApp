import LoadingRipple from "./LoadingRipple";
import { palette } from "../theme";
import { useState } from "react";

interface ContainerProps {
  text: string;
  onClick: () => any;
  disabled?: boolean;
}

const CircularButton: React.FC<ContainerProps> = ({
  text,
  onClick,
  disabled,
}) => {
  const [processing, setProcessing] = useState(false);

  const handleClick = async () => {
    if (processing || disabled) return;
    setProcessing(true);
    await onClick();
    setProcessing(false);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <button
        type="button"
        disabled={disabled || processing}
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "200px",
          height: "200px",
          borderRadius: "100%",
          backgroundColor: processing
            ? palette.gray.darkest
            : palette.gray.main,
          fontSize: "28px",
          fontWeight: 500,
          boxShadow: "0 2px 4px darkslategray",
          transition: "background-color 0.2s ease-in-out",
          border: "none",
          cursor: disabled || processing ? "not-allowed" : "pointer",
        }}
        onClick={handleClick}
        aria-busy={processing}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            opacity: processing ? 1 : 0,
            transition: "opacity 0.2s ease-in-out",
          }}
        >
          <LoadingRipple />
        </div>
        <p
          style={{
            padding: "20px",
            textAlign: "center",
            opacity: processing ? 0 : 1,
            transition: "opacity 0.2s ease-in-out",
          }}
        >
          {text}
        </p>
      </button>
    </div>
  );
};

export default CircularButton;

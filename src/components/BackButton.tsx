import { useRouter } from "next/router";

import { ArrowBackOutline } from "./icons";
import { palette } from "../theme";

interface ContainerProps {
  text: string;
  href: string;
}

const BackButton: React.FC<ContainerProps> = ({ text, href }) => {
  const router = useRouter();

  return (
    <button
      type="button"
      style={{
        position: "absolute",
        top: "44px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "16px",
        color: palette.blue.main,
        cursor: "pointer",
        background: "transparent",
        border: "none",
        padding: 0,
      }}
      onClick={() => router.push(href)}
    >
      <ArrowBackOutline size={18} />
      <p>{text}</p>
    </button>
  );
};

export default BackButton;

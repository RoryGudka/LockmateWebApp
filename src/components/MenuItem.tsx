import { ChevronForwardOutline } from "./icons";
import { palette } from "../theme";

interface ContainerProps {
  text: string;
  onClick: () => any;
  hasBorder: boolean;
}

const MenuItem: React.FC<ContainerProps> = ({ text, onClick, hasBorder }) => {
  return (
    <div
      className="menu-item"
      style={{ display: "flex", cursor: "pointer" }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <div style={{ height: "1px", width: "24px" }} />
      <div
        style={{
          flex: "1 0 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          paddingLeft: "0px",
          borderBottom: hasBorder ? `1px solid ${palette.gray.dark}` : "none",
        }}
      >
        {text}
        <span style={{ color: palette.gray.darkest }}>
          <ChevronForwardOutline size={18} />
        </span>
      </div>
    </div>
  );
};

export default MenuItem;

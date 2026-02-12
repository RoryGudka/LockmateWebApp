import LoadingSpinner from "./LoadingSpinner";
import MenuItem from "./MenuItem";
import { palette } from "../theme";

interface ContainerProps {
  title: string;
  items: { text: string; onClick: () => any }[];
  isLoading?: boolean;
  loadingText?: string;
}

const Menu: React.FC<ContainerProps> = ({
  title,
  items,
  isLoading,
  loadingText,
}) => {
  return (
    <div
      style={{
        marginTop: "40px",
      }}
    >
      <div
        style={{
          marginTop: items.length ? 0 : "-12px",
          opacity: items.length ? 1 : 0,
          transition: "opacity 0.3s ease-in-out, margin-top 0.3s ease-in-out",
        }}
      >
        <p style={{ fontWeight: 600, margin: 0, marginBottom: "8px" }}>
          {title}
        </p>
        <div
          style={{
            textAlign: "left",
            backgroundColor: palette.gray.main,
            borderRadius: "8px",
            overflowY: "auto",
            maxHeight: "240px",
          }}
        >
          {items.map(({ text, onClick }, i) => (
            <MenuItem
              key={`${text}-${i}`}
              text={text}
              onClick={onClick}
              hasBorder={i !== items.length - 1}
            />
          ))}
        </div>
      </div>
      {!items.length && isLoading ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <p style={{ color: palette.blue.main }}>{loadingText}</p>
          <div
            className="lds-spinner-gray"
            style={{ marginLeft: "-28px", scale: "1.5" }}
          >
            <LoadingSpinner />
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default Menu;

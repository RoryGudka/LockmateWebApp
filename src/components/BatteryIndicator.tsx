import {
  BatteryDeadOutline,
  BatteryFullOutline,
  BatteryHalfOutline,
} from "./icons";
import { palette } from "../theme";

interface ContainerProps {
  percent: number;
}

const BatteryIndicator: React.FC<ContainerProps> = ({ percent }) => {
  const warning = percent >= 10 && percent < 20;
  const safe = percent >= 20;

  return (
    <div
      style={{
        marginTop: "16px",
        padding: "8px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        textAlign: "left",
        border: `1px solid ${
          safe
            ? palette.safe.main
            : warning
            ? palette.warning.main
            : palette.alert.main
        }`,
        backgroundColor: safe
          ? palette.safe.light
          : warning
          ? palette.warning.light
          : palette.alert.light,
        color: safe
          ? palette.safe.main
          : warning
          ? palette.warning.main
          : palette.alert.main,
        borderRadius: "8px",
        fontSize: "40px",
      }}
    >
      {safe ? (
        <BatteryFullOutline size={40} />
      ) : warning ? (
        <BatteryHalfOutline size={40} />
      ) : (
        <BatteryDeadOutline size={40} />
      )}
      <p style={{ fontSize: "16px", margin: 0 }}>
        {safe
          ? "Battery level normal, no need to worry"
          : warning
          ? "Battery is low, consider replacing within 1 month"
          : "Battery is very low, consider replacing within 2 weeks"}
      </p>
    </div>
  );
};

export default BatteryIndicator;

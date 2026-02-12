import { BatteryDead } from "./icons";

interface ContainerProps {}

const LowBatteryAlert: React.FC<ContainerProps> = ({}) => {
  return (
    <div
      style={{
        padding: "8px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        textAlign: "left",
        backgroundColor: "#faeeee",
        color: "#f70f0f",
        borderRadius: "8px",
        fontSize: "40px",
      }}
    >
      <BatteryDead size={40} />
      <p style={{ fontSize: "16px", margin: 0 }}>
        Battery low, consider replacing within 2 weeks
      </p>
    </div>
  );
};

export default LowBatteryAlert;

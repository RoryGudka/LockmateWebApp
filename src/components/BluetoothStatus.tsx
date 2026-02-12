import { BluetoothIcon, WarningIcon } from "./icons";
import { isBluetoothAvailable } from "../libs/bluetooth-adapter";

/**
 * Optional component to display Bluetooth availability status
 */
export const BluetoothStatus: React.FC = () => {
  const available = isBluetoothAvailable();

  if (!available) {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 12px",
          borderRadius: "16px",
          backgroundColor: "#fff8e4",
          color: "#b38700",
          fontSize: "14px",
        }}
      >
        <WarningIcon size={16} />
        <span>Web Bluetooth not supported. Use Chrome, Edge, or Opera.</span>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "6px 12px",
        borderRadius: "16px",
        backgroundColor: "#e8f9f1",
        color: "#0a7a36",
        fontSize: "14px",
      }}
    >
      <BluetoothIcon size={16} />
      <span>Web Bluetooth Available</span>
    </div>
  );
};

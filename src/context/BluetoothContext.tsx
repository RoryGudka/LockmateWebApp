import React, { useState } from "react";

import { BleDevice } from "../model";

type ContextProps = {
  bleDevice: BleDevice | null;
  setBleDevice: React.Dispatch<React.SetStateAction<BleDevice | null>>;
};

const BluetoothContext = React.createContext<ContextProps>({
  bleDevice: null,
  setBleDevice: () => {},
});

interface Props {
  children: React.ReactNode;
}

export const BluetoothProvider: React.FC<Props> = ({ children }) => {
  const [bleDevice, setBleDevice] = useState<BleDevice | null>(null);

  return (
    <BluetoothContext.Provider value={{ bleDevice, setBleDevice }}>
      {children}
    </BluetoothContext.Provider>
  );
};

export function useBluetooth() {
  return React.useContext(BluetoothContext);
}

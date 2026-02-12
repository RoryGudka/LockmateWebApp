import React, { useState } from "react";

import { Device } from "../model";

type ContextProps = {
  devices: Device[] | null;
  setDevices: React.Dispatch<React.SetStateAction<Device[] | null>>;
  device: Device | null;
  setDevice: React.Dispatch<React.SetStateAction<Device | null>>;
};

const DeviceContext = React.createContext<ContextProps>({
  devices: null,
  setDevices: () => {},
  device: null,
  setDevice: () => {},
});

interface Props {
  children: React.ReactNode;
}

export const DeviceProvider: React.FC<Props> = ({ children }) => {
  const [devices, setDevices] = useState<Device[] | null>(null);
  const [device, setDevice] = useState<Device | null>(null);

  return (
    <DeviceContext.Provider value={{ devices, setDevices, device, setDevice }}>
      {children}
    </DeviceContext.Provider>
  );
};

export function useDevice() {
  return React.useContext(DeviceContext);
}

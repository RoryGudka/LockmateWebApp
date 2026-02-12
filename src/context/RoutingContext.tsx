import React, { useEffect } from "react";
import { getAccessToken, getDevice, getDevices } from "../libs/storage";
import { getLinkedDevices, useLogin } from "../libs/server";

import { getCredentials } from "../libs/biometrics";
import { useDevice } from "./DeviceContext";
import { useRouter } from "next/router";
import { useUser } from "./UserContext";

type ContextProps = {
  reroute: () => void;
};

const RoutingContext = React.createContext<ContextProps>({
  reroute: () => {},
});

interface Props {
  children: React.ReactNode;
}

export const RoutingProvider: React.FC<Props> = ({ children }) => {
  const { devices, setDevices, device, setDevice } = useDevice();
  const { accessToken, setAccessToken } = useUser();
  const router = useRouter();
  const login = useLogin();

  const reroute = async (): Promise<void> => {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      const credentials = await getCredentials();
      if (!credentials) {
        await router.push("/login");
        return;
      } else {
        try {
          await login(credentials.username, credentials.password);
          await getLinkedDevices();
          return reroute();
        } catch (e) {
          await router.push("/login");
          return;
        }
      }
    } else setAccessToken(accessToken);

    await getLinkedDevices();

    const devices = await getDevices();
    if (!devices) {
      await router.push("/device_select");
      return;
    } else setDevices(devices);

    const device = await getDevice();
    if (!device) {
      await router.push("/device_select");
      return;
    } else setDevice(device);

    const isConnectedToNetwork =
      new Date().getTime() - new Date(device.lastUpdateTimestamp).getTime() <
      300000;
    if (!isConnectedToNetwork) {
      await router.push("/device_select");
      return;
    }

    const isCalibrated = device.isUnlockCalibrated && device.isLockCalibrated;
    if (!isCalibrated) {
      await router.push("/calibrate_unlocked");
      return;
    }

    router.push("/home");
  };

  useEffect(() => {
    if (!router.isReady) return;
    reroute();
  }, [router.isReady]);

  useEffect(() => {}, [devices, device, accessToken]);

  return (
    <RoutingContext.Provider value={{ reroute }}>
      {children}
    </RoutingContext.Provider>
  );
};

export function useReroute() {
  return React.useContext(RoutingContext);
}

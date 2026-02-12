import { getDevice, getDevices } from "../libs/storage";
import {
  useConnectToNetwork,
  useRequestAuthentication,
} from "../libs/bluetooth";

import BackButton from "../components/BackButton";
import InlineMessage from "../components/InlineMessage";
import Page from "../components/Page";
import PageWrapper from "../components/PageWrapper";
import TextButton from "../components/TextButton";
import TextField from "../components/TextField";
import Title from "../components/Title";
import { getLinkedDevices } from "../libs/server";
import { useBluetooth } from "../context/BluetoothContext";
import { useDevice } from "../context/DeviceContext";
import { useNetwork } from "../context/NetworkContext";
import { useRouter } from "next/router";
import { useState } from "react";
import { useUser } from "../context/UserContext";

const NetworkPasswordPage: React.FC = () => {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { bleDevice } = useBluetooth();
  const { network } = useNetwork();
  const { userId } = useUser();
  const connectToNetwork = useConnectToNetwork();
  const requestAuthentication = useRequestAuthentication();
  const { setDevices, setDevice } = useDevice();

  const handleJoinNetwork = async () => {
    setError("");
    if (!userId) {
      setError("User not logged in. Please log in first.");
      return router.push("/login");
    }

    if (!bleDevice) {
      setError("No device connected.");
      return router.push("/device_select");
    }

    if (!network) {
      setError("No network selected.");
      return router.push("/network_select");
    }

    if (!password) {
      setError("Please enter the WiFi password.");
      return;
    }

    let connected = false;
    for (let i = 0; i < 5 && !connected; i++) {
      try {
        connected = await connectToNetwork(bleDevice, network, password);
      } catch (e) {
        console.error("Connect attempt failed:", e);
      }
    }
    if (!connected) {
      setError("Failed to connect to network. Please try again.");
      return;
    }

    let authenticated = false;
    for (let i = 0; i < 5 && !authenticated; i++) {
      try {
        authenticated = await requestAuthentication(bleDevice, userId);
      } catch (e) {
        console.error("Auth attempt failed:", e);
      }
    }
    if (!authenticated) {
      setError("Failed to authenticate with device. Please try again.");
      return;
    }

    await router.push("/calibrate_unlocked");

    // Update stored values and context values for devices and device
    await getLinkedDevices();

    const devices = await getDevices();
    if (!devices) return router.push("/device_select");
    else setDevices(devices);

    const device = await getDevice();
    if (!device) return router.push("/device_select");
    else setDevice(device);
  };

  return (
    <Page>
      <PageWrapper>
        <BackButton text="Back" href="/network_select" />
        <Title text={`Enter password for "${network!}"`} />
        <TextField
          value={password}
          onChange={(e: any) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          onKeyDown={(event: any) => {
            if (event.key === "Enter") handleJoinNetwork();
          }}
        />
        <InlineMessage text={error} tone="error" />
        <div style={{ marginTop: "16px" }}>
          <TextButton
            text="Join network"
            onClick={handleJoinNetwork}
            disabled={!password}
            variant="contained"
          />
        </div>
      </PageWrapper>
    </Page>
  );
};

export default NetworkPasswordPage;

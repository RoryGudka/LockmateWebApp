import BackButton from "../components/BackButton";
import Body from "../components/Body";
import InlineMessage from "../components/InlineMessage";
import Page from "../components/Page";
import PageWrapper from "../components/PageWrapper";
import TextButton from "../components/TextButton";
import TextField from "../components/TextField";
import Title from "../components/Title";
import { useBluetooth } from "../context/BluetoothContext";
import { useConfirmDevicePassword } from "../libs/bluetooth";
import { useRouter } from "next/router";
import { useState } from "react";

const DevicePasswordPage: React.FC = () => {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const confirmDevicePassword = useConfirmDevicePassword();
  const { bleDevice, setBleDevice } = useBluetooth();

  const handlePairDevice = async () => {
    try {
      setError("");
      if (!password) {
        setError("Please enter the pairing password.");
        return;
      }
      const status = await confirmDevicePassword(bleDevice!.id, password);
      if (status !== "success") {
        setError("Failed to connect to device. Please try again.");
        return;
      } else {
        setBleDevice({ ...bleDevice!, password });
        router.push("/network_select");
      }
    } catch (e) {
      setError("Device connection failed. Please try again.");
      router.push("/device_select");
    }
  };

  // Handle case when bleDevice is not available (SSR or initial render)
  if (!bleDevice) {
    return (
      <Page>
        <PageWrapper>
          <BackButton text="Back" href="/device_select" />
          <Title text="No device selected" />
          <Body text="Please select a device first." />
        </PageWrapper>
      </Page>
    );
  }

  return (
    <Page>
      <PageWrapper>
        <BackButton text="Back" href="/device_select" />
        <Title text={`Enter pairing password for "${bleDevice.name}"`} />
        <Body text="Enter the pairing password located in the package that your Lockmate device came in" />
        <Body
          text={`This password is device specific, and you cannot use on associated with another Lockmate device`}
        />
        <TextField
          value={password}
          onChange={(e: any) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          onKeyDown={(event: any) => {
            if (event.key === "Enter") handlePairDevice();
          }}
        />
        <InlineMessage text={error} tone="error" />
        <div style={{ marginTop: "16px" }}>
          <TextButton
            text="Pair with Lockmate"
            onClick={handlePairDevice}
            disabled={!password}
            variant="contained"
          />
        </div>
      </PageWrapper>
    </Page>
  );
};

export default DevicePasswordPage;

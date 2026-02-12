import { BleDevice } from "../model";
import { useConnectDevice, useGetBleDevices } from "../libs/bluetooth";

import Body from "../components/Body";
import InlineMessage from "../components/InlineMessage";
import Menu from "../components/Menu";
import Page from "../components/Page";
import PageWrapper from "../components/PageWrapper";
import Title from "../components/Title";
import TextButton from "../components/TextButton";
import { useBluetooth } from "../context/BluetoothContext";
import { useRouter } from "next/router";
import { useState } from "react";

const DeviceSelectPage: React.FC = () => {
  const router = useRouter();
  const { bleDevices, isScanning, startScanning } = useGetBleDevices();
  const connectDevice = useConnectDevice();
  const { setBleDevice } = useBluetooth();
  const [error, setError] = useState("");
  const [showScanning, setShowScanning] = useState(false);

  const handleConnect = async (bleDevice: BleDevice) => {
    try {
      setError("");
      await connectDevice(bleDevice.id);
      setBleDevice(bleDevice);
      router.push("/device_password");
    } catch (e) {
      setError("Failed to connect to device. Please try again.");
    }
  };

  const handleAddDevice = () => {
    setShowScanning(true);
    startScanning();
  };

  // Show initial "no devices" view
  if (!showScanning) {
    return (
      <Page>
        <PageWrapper>
          <Title text="No active Lockmate devices" />
          <Body text="You either have no linked Lockmate devices on your account, or your device may have stopped responding." />
          <Body text="If this is unexpected, try disconnecting and reconnecting your Lockmate device from your wall outlet." />
          <Body text="To add a new device, make sure it's powered on and ready to pair, then tap the button below." />
          <div style={{ marginTop: "24px" }}>
            <TextButton
              text="Add new Lockmate device"
              onClick={handleAddDevice}
              variant="contained"
            />
          </div>
        </PageWrapper>
      </Page>
    );
  }

  // Show scanning view
  return (
    <Page>
      <PageWrapper>
        <Title text="Let's get set up" />
        <Body text="Step 1. Attach your Lockmate controller to your door as specified in the instructions" />
        <Body text="Step 2. Connect your Lockmate communicator to a power outlet near your Lockmate controller" />
        <Body text="Step 3. Hold the pairing button on your Lockmate controller for 2 seconds" />
        <InlineMessage text={error} tone="error" />
        {!isScanning && bleDevices.length === 0 && (
          <Menu
            title="Ready to scan"
            items={[
              {
                text: "Start Scan",
                onClick: startScanning,
              },
            ]}
          />
        )}
        {(isScanning || bleDevices.length > 0) && (
          <Menu
            title="Devices found"
            items={bleDevices.map((bleDevice) => ({
              text: bleDevice.name,
              onClick: () => handleConnect(bleDevice),
            }))}
            isLoading={isScanning && bleDevices.length === 0}
            loadingText="Searching for devices"
          />
        )}
      </PageWrapper>
    </Page>
  );
};

export default DeviceSelectPage;

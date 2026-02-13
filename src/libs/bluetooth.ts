import {
  LOCKMATE_CHARACTERISTIC_RX,
  LOCKMATE_CHARACTERISTIC_TX,
  LOCKMATE_SERVICE,
  ScanResult,
  bluetoothAdapter,
  dataViewToText,
  textToDataView,
} from "./bluetooth-adapter";
import { useEffect, useState } from "react";

import { BleDevice } from "../model";
import { useFlags } from "../context/FlagsContext";
import { useRouter } from "next/router";

enum BLE_API {
  CONFIRM_PASSWORD = "CONFIRM_PASSWORD",
  GET_AVAILABLE_NETWORKS = "GET_AVAILABLE_NETWORKS",
  CONNECT_TO_NETWORK = "CONNECT_TO_NETWORK",
  REQUEST_AUTHENTICATION = "REQUEST_AUTHENTICATION",
}

enum BLE_PARAM {
  API = "API",
  PASSWORD = "PASSWORD",
  NETWORK_SSID = "NETWORK_SSID",
  NETWORK_PASSWORD = "NETWORK_PASSWORD",
  USER_ID = "USER_ID",
  REQUEST_ID = "REQUEST_ID",
}

const convertObjToQuerystring = (obj: { [key: string]: string }) => {
  return Object.entries(obj)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
};

const convertQuerystringToObj = (querystring: string) => {
  if (querystring.indexOf("=") === -1) return {};
  return Object.fromEntries(
    querystring
      .split("\n")[0]
      .split("&")
      .map((str) => str.split("=")),
  );
};

async function startScan(
  onDeviceFound: (devices: ScanResult) => any,
  onError: () => any,
) {
  try {
    await bluetoothAdapter.initialize();
    await bluetoothAdapter.requestScan([LOCKMATE_SERVICE], (result) => {
      console.log("received new scan result", result);
      onDeviceFound(result);
    });
  } catch (error) {
    console.error(error);
    onError();
  }
}

async function stopScan() {
  try {
    await bluetoothAdapter.stopScan();
    console.log("stopped scanning");
  } catch (error) {
    console.error(error);
  }
}

export function useGetBleDevices() {
  const [bleDevices, setBleDevices] = useState<BleDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const { isBluetoothEnabled } = useFlags();

  const startScanning = async () => {
    if (isScanning) return;
    setIsScanning(true);
    setBleDevices([]); // Clear previous results

    if (isBluetoothEnabled) {
      try {
        await startScan(
          (result) => {
            const bleDevice: BleDevice = {
              id: result.device.deviceId,
              name: result.device.name || "Unknown Device",
            };

            const isLockmate = bleDevice.name
              ?.toLowerCase()
              .includes("lockmate");
            if (!isLockmate) return;

            setBleDevices((prevDevices) => {
              const isNew = !prevDevices.some(
                (device) => device.id === result.device.deviceId,
              );
              if (!isNew) return prevDevices;
              return [...prevDevices, bleDevice];
            });
          },
          () => {
            console.log("An error occurred while scanning");
            setIsScanning(false);
          },
        );
      } catch (error) {
        console.error("Failed to start scan:", error);
        setIsScanning(false);
      }
    } else {
      // Mock devices for testing
      setTimeout(
        () => {
          setBleDevices([{ id: "37219402", name: "Lockmate E203" }]);
          setTimeout(
            () => {
              setBleDevices([
                { id: "37219402", name: "Lockmate E203" },
                { id: "32569403", name: "Lockmate H013" },
              ]);
            },
            Math.random() * 2000 + 1000,
          );
        },
        Math.random() * 2000 + 1000,
      );
    }
  };

  useEffect(() => {
    return () => {
      if (isScanning) {
        stopScan();
      }
    };
  }, [isScanning]);

  return { bleDevices, isScanning, startScanning };
}

// Track which devices have notifications enabled
const devicesWithNotifications = new Set<string>();

// Request tracking system
let nextRequestId = 1;
interface PendingRequest {
  resolve: (value: { [key: string]: string }) => void;
  reject: (reason: string) => void;
  timeout: NodeJS.Timeout;
}
const pendingRequests = new Map<string, PendingRequest>();

// Global notification handler that routes responses by request ID
function handleNotification(deviceId: string, value: DataView) {
  const text = dataViewToText(value);
  console.log("Notification received:", text);

  // Simple buffer per device to accumulate chunks
  if (!notificationBuffers.has(deviceId)) {
    notificationBuffers.set(deviceId, "");
  }

  let buffer = notificationBuffers.get(deviceId)!;
  buffer += text;

  // Check if we have a complete message (ends with newline)
  if (buffer[buffer.length - 1] === "\n") {
    const obj = convertQuerystringToObj(buffer);
    console.log("Complete message:", obj);

    // Extract request ID from response
    const requestId = obj[BLE_PARAM.REQUEST_ID];

    if (requestId && pendingRequests.has(requestId)) {
      const pending = pendingRequests.get(requestId)!;
      clearTimeout(pending.timeout);
      pending.resolve(obj);
      pendingRequests.delete(requestId);
    } else {
      console.log("No pending request for ID:", requestId);
    }

    // Clear buffer
    notificationBuffers.set(deviceId, "");
  } else {
    notificationBuffers.set(deviceId, buffer);
  }
}

const notificationBuffers = new Map<string, string>();

export async function connectDevice(id: string) {
  await bluetoothAdapter.connect(id, () => {
    console.log("Device disconnected", id);
    devicesWithNotifications.delete(id);
    notificationBuffers.delete(id);
    // Cancel all pending requests for this device
    for (const [requestId, pending] of pendingRequests.entries()) {
      if (requestId.startsWith(id + "-")) {
        clearTimeout(pending.timeout);
        pending.reject("Device disconnected");
        pendingRequests.delete(requestId);
      }
    }
  });
  console.log("Connected to device", id);

  // Immediately enable notifications on TX characteristic
  // This writes to CCCD and prepares the device to send notifications
  if (!devicesWithNotifications.has(id)) {
    await bluetoothAdapter.startNotifications(
      id,
      LOCKMATE_SERVICE,
      LOCKMATE_CHARACTERISTIC_TX,
      (value) => handleNotification(id, value),
    );
    devicesWithNotifications.add(id);
    console.log("TX notifications enabled");

    // Give the CCCD write time to complete
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

export function useConnectDevice() {
  const { isBluetoothEnabled } = useFlags();
  if (!isBluetoothEnabled) return placeholderAsyncFunc;
  else return connectDevice;
}

export async function disconnectDevice(id: string) {
  await bluetoothAdapter.disconnect(id);
  console.log("Disconnected from device", id);
}

export function useGetDisconnectDevice(id: string) {
  const { isBluetoothEnabled } = useFlags();
  if (!isBluetoothEnabled) return placeholderAsyncFunc;
  else return disconnectDevice;
}

async function sendAndWaitForResponse(
  deviceId: string,
  data: { [key: string]: string },
  timeoutMs: number = 10000,
): Promise<{ [key: string]: string }> {
  // Generate unique request ID
  const requestId = `request-${nextRequestId++}`;

  // Add request ID to data
  const dataWithId = {
    ...data,
    [BLE_PARAM.REQUEST_ID]: requestId,
  };

  // Create promise for this request
  const promise = new Promise<{ [key: string]: string }>((resolve, reject) => {
    const timeout = setTimeout(() => {
      console.log(`Request ${requestId} timed out`);
      pendingRequests.delete(requestId);
      reject("Timeout");
    }, timeoutMs);

    pendingRequests.set(requestId, { resolve, reject, timeout });
  });

  try {
    // Send the message
    const dataView = textToDataView(`${convertObjToQuerystring(dataWithId)}\n`);
    await bluetoothAdapter.write(
      deviceId,
      LOCKMATE_SERVICE,
      LOCKMATE_CHARACTERISTIC_RX,
      dataView,
      { timeout: timeoutMs },
    );
    console.log(`Sent request ${requestId}:`, dataWithId);
  } catch (e: any) {
    // Clean up on write error
    const pending = pendingRequests.get(requestId);
    if (pending) {
      clearTimeout(pending.timeout);
      pendingRequests.delete(requestId);
    }
    console.error(e);
    throw new Error(e.message);
  }

  return promise;
}

export async function confirmPasswordWithDevice(id: string, password: string) {
  const { status } = await sendAndWaitForResponse(id, {
    [BLE_PARAM.API]: BLE_API.CONFIRM_PASSWORD,
    [BLE_PARAM.PASSWORD]: password,
  });
  return status;
}

export function useConfirmDevicePassword() {
  const { isBluetoothEnabled } = useFlags();
  if (!isBluetoothEnabled) return placeholderAsyncFunc;
  else return confirmPasswordWithDevice;
}

async function getNetworks(bleDevice: BleDevice) {
  const response = await sendAndWaitForResponse(bleDevice.id, {
    [BLE_PARAM.API]: BLE_API.GET_AVAILABLE_NETWORKS,
    [BLE_PARAM.PASSWORD]: bleDevice.password || "",
  });
  
  console.log("Full response from device:", response);
  
  // Try different possible field names
  const networksString = response.networks || response.NETWORKS || response.available_networks || "";
  
  if (!networksString) {
    console.warn("No networks field found in response!");
    return [];
  }
  
  // FIRST decode the entire string, THEN split by comma
  const decodedString = decodeURIComponent(networksString);
  console.log("Decoded networks string:", decodedString);
  
  // Now split by comma and filter out empty strings
  const networkList = decodedString
    .split(",")
    .map((network: string) => network.trim())
    .filter((network: string) => network.length > 0);
  
  console.log("Final parsed network list:", networkList);
  
  return networkList;
}

export function useGetNetworks(bleDevice: BleDevice) {
  const [networks, setNetworks] = useState<string[]>([]);
  const { isBluetoothEnabled } = useFlags();
  const router = useRouter();

  useEffect(() => {
    let interval: any;
    if (isBluetoothEnabled) {
      if (router.pathname === "/network_select") {
        getNetworks(bleDevice)
          .then((newNetworks) => {
            setNetworks((networks) => [
              ...new Set([...(networks || []), ...(newNetworks || [])]),
            ]);
          })
          .catch((e) => console.error("Failed to get networks", e));

        interval = setInterval(async () => {
          getNetworks(bleDevice)
            .then((newNetworks) => {
              setNetworks((networks) => [
                ...new Set([...(networks || []), ...(newNetworks || [])]),
              ]);
            })
            .catch((e) => console.error("Failed to get networks", e));
        }, 10000);
      }
    }

    return () => {
      clearInterval(interval);
    };
  }, [router.pathname]);

  return networks;
}

export async function connectToNetwork(
  bleDevice: BleDevice,
  networkId: string,
  networkPassword: string,
) {
  console.log("Connecting to network");
  const { status } = await sendAndWaitForResponse(bleDevice.id, {
    [BLE_PARAM.API]: BLE_API.CONNECT_TO_NETWORK,
    [BLE_PARAM.PASSWORD]: bleDevice.password || "",
    [BLE_PARAM.NETWORK_SSID]: networkId,
    [BLE_PARAM.NETWORK_PASSWORD]: networkPassword,
  });
  return status === "success";
}

export function useConnectToNetwork() {
  const { isBluetoothEnabled } = useFlags();
  if (!isBluetoothEnabled) return placeholderAsyncFunc;
  else return connectToNetwork;
}

export async function requestAuthentication(
  bleDevice: BleDevice,
  email: string,
) {
  console.log("Requesting authentication");
  const { status } = await sendAndWaitForResponse(bleDevice.id, {
    [BLE_PARAM.API]: BLE_API.REQUEST_AUTHENTICATION,
    [BLE_PARAM.PASSWORD]: bleDevice.password || "",
    [BLE_PARAM.USER_ID]: email,
  });
  return status === "success";
}

export function useRequestAuthentication() {
  const { isBluetoothEnabled } = useFlags();
  if (!isBluetoothEnabled) return placeholderAsyncFunc;
  else return requestAuthentication;
}

export const placeholderAsyncFunc = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 1000);
  });
};

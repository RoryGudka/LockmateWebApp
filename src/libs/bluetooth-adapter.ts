export interface ScanResult {
  device: {
    deviceId: string;
    name?: string;
  };
  localName?: string;
  rssi?: number;
  txPower?: number;
  uuids?: string[];
}

export const LOCKMATE_SERVICE = "ab907856-3412-3412-3412-785634123412";
export const LOCKMATE_CHARACTERISTIC_RX =
  "ad907856-3412-3412-3412-785634123412";
export const LOCKMATE_CHARACTERISTIC_TX =
  "ac907856-3412-3412-3412-785634123412";

export interface BluetoothAdapter {
  initialize(): Promise<void>;
  requestScan(
    services: string[],
    onResult: (result: ScanResult) => void,
  ): Promise<void>;
  stopScan(): Promise<void>;
  connect(
    deviceId: string,
    onDisconnect?: (deviceId: string) => void,
  ): Promise<void>;
  disconnect(deviceId: string): Promise<void>;
  write(
    deviceId: string,
    service: string,
    characteristic: string,
    data: DataView,
    options?: { timeout?: number },
  ): Promise<void>;
  startNotifications(
    deviceId: string,
    service: string,
    characteristic: string,
    callback: (value: DataView) => void,
  ): Promise<void>;
  stopNotifications(
    deviceId: string,
    service: string,
    characteristic: string,
  ): Promise<void>;
}

const isBrowser = () => typeof window !== "undefined";

export const dataViewToText = (dataView: DataView) => {
  const decoder = new TextDecoder();
  const buffer = dataView.buffer.slice(
    dataView.byteOffset,
    dataView.byteOffset + dataView.byteLength,
  );
  return decoder.decode(buffer);
};

export const textToDataView = (text: string) => {
  const encoder = new TextEncoder();
  const buffer = encoder.encode(text);
  return new DataView(buffer.buffer);
};

class WebBluetoothAdapter implements BluetoothAdapter {
  private devices: Map<string, BluetoothDevice> = new Map();
  private servers: Map<string, BluetoothRemoteGATTServer> = new Map();
  private characteristics: Map<string, BluetoothRemoteGATTCharacteristic> =
    new Map();

  async initialize(): Promise<void> {
    if (!isBluetoothAvailable()) {
      throw new Error("Web Bluetooth API is not available in this browser");
    }
    console.log("Web Bluetooth initialized");
  }

  async requestScan(
    services: string[],
    onResult: (result: ScanResult) => void,
  ): Promise<void> {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services }],
      });

      this.devices.set(device.id, device);

      const result: ScanResult = {
        device: {
          deviceId: device.id,
          name: device.name || "Unknown Device",
        },
        localName: device.name,
        uuids: services,
      };

      onResult(result);
    } catch (error) {
      console.error("Device selection cancelled or failed:", error);
      throw error;
    }
  }

  async stopScan(): Promise<void> {
    console.log("Web Bluetooth: scan stop called (no-op)");
  }

  async connect(
    deviceId: string,
    onDisconnect?: (deviceId: string) => void,
  ): Promise<void> {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error(`Device ${deviceId} not found. Call requestScan first.`);
    }

    if (!device.gatt) {
      throw new Error("Device GATT server not available");
    }

    const server = await device.gatt.connect();
    this.servers.set(deviceId, server);

    if (onDisconnect) {
      device.addEventListener("gattserverdisconnected", () => {
        onDisconnect(deviceId);
      });
    }

    console.log("Web Bluetooth: Connected to device", deviceId);
  }

  async disconnect(deviceId: string): Promise<void> {
    const server = this.servers.get(deviceId);
    if (server?.connected) {
      server.disconnect();
      this.servers.delete(deviceId);
    }
    console.log("Web Bluetooth: Disconnected from device", deviceId);
  }

  async write(
    deviceId: string,
    service: string,
    characteristic: string,
    data: DataView,
  ): Promise<void> {
    const char = await this.getCharacteristic(
      deviceId,
      service,
      characteristic,
    );
    await char.writeValueWithoutResponse(data);
  }

  async startNotifications(
    deviceId: string,
    service: string,
    characteristic: string,
    callback: (value: DataView) => void,
  ): Promise<void> {
    const char = await this.getCharacteristic(
      deviceId,
      service,
      characteristic,
    );

    await char.startNotifications();

    char.addEventListener("characteristicvaluechanged", (event: any) => {
      const value = event.target.value as DataView;
      callback(value);
    });
  }

  async stopNotifications(
    deviceId: string,
    service: string,
    characteristic: string,
  ): Promise<void> {
    const char = await this.getCharacteristic(
      deviceId,
      service,
      characteristic,
    );
    await char.stopNotifications();
  }

  private async getCharacteristic(
    deviceId: string,
    serviceUuid: string,
    characteristicUuid: string,
  ): Promise<BluetoothRemoteGATTCharacteristic> {
    const key = `${deviceId}-${serviceUuid}-${characteristicUuid}`;

    if (this.characteristics.has(key)) {
      return this.characteristics.get(key)!;
    }

    const server = this.servers.get(deviceId);
    if (!server?.connected) {
      throw new Error(`Device ${deviceId} is not connected`);
    }

    const service = await server.getPrimaryService(serviceUuid);
    const characteristic = await service.getCharacteristic(characteristicUuid);

    this.characteristics.set(key, characteristic);
    return characteristic;
  }
}

export const bluetoothAdapter: BluetoothAdapter = new WebBluetoothAdapter();

export function isBluetoothAvailable(): boolean {
  return (
    isBrowser() && typeof navigator !== "undefined" && "bluetooth" in navigator
  );
}

export interface GuestAccess {
  email: string;
  startTime: string;
  expirationTime: string | null;
}

export interface Device {
  deviceId: string;
  availableNetworks: string[];
  connectedNetwork: string;
  batteryStatus: "high" | "medium" | "low";
  isUnlockCalibrated: boolean;
  isLockCalibrated: boolean;
  isLocked: boolean;
  lastUpdateTimestamp: string;
  ownerId?: string;
  linkedUserIds?: string[];
  guests?: GuestAccess[];
}

export interface BleDevice {
  id: string;
  name: string;
  password?: string;
}

export interface User {
  id: string;
}

import { Device } from "../model";
import jwt_decode from "jwt-decode";

interface AccessToken {
  userId: string;
  iat: number;
  exp: number;
}

const isBrowser = () => typeof window !== "undefined";

export const getAccessToken = async () => {
  if (!isBrowser()) return null;

  const accessToken = window.localStorage.getItem("access_token");
  if (!accessToken) return null;

  const decoded = jwt_decode(accessToken) as AccessToken;
  if (decoded.exp * 1000 < new Date().getTime()) return null;

  return accessToken;
};

export const setAccessToken = async (accessToken: string) => {
  if (!isBrowser()) return;
  window.localStorage.setItem("access_token", accessToken);
};

export const clearAccessToken = async () => {
  if (!isBrowser()) return;
  window.localStorage.removeItem("access_token");
};

export const getDevices = async () => {
  if (!isBrowser()) return null;

  const devices = window.localStorage.getItem("devices");
  if (!devices) return null;

  return JSON.parse(devices) as Device[];
};

export const setDevices = async (devices: Device[]) => {
  if (!isBrowser()) return;
  window.localStorage.setItem("devices", JSON.stringify(devices));
};

export const clearDevices = async () => {
  if (!isBrowser()) return;
  window.localStorage.removeItem("devices");
};

export const getDevice = async () => {
  const devices = await getDevices();
  if (!devices) return null;

  return devices[0] as Device;
};

export const setDevice = async (_devices: Device[]) => {
  return;
};

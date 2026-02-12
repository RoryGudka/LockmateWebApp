import {
  clearAccessToken,
  clearDevices,
  getAccessToken,
  setAccessToken,
  setDevice,
  setDevices,
} from "./storage";

import axios from "axios";
import { setCredentials, unsetCredentials } from "./biometrics";
import { useFlags } from "../context/FlagsContext";
import { useUser } from "../context/UserContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

const apiClient = axios.create({
  baseURL: API_URL,
});

const handleAuthError = () => {
  if (typeof window === "undefined") return;
  void clearAccessToken();
  void clearDevices();
  void unsetCredentials();
  window.location.href = "/login";
};

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message =
      error?.response?.data?.error || error?.response?.data?.message || "";
    if (
      status === 401 ||
      status === 403 ||
      /invalid access token/i.test(message) ||
      /security token/i.test(message)
    ) {
      handleAuthError();
    }
    return Promise.reject(error);
  },
);

export const useLogin = () => {
  const { setAccessToken: setAccessTokenState } = useUser();
  return async (email: string, password: string) => {
    const response = await apiClient.post(`/auth/login`, {
      email,
      password,
    });
    const accessToken = String(response.data.data.accessToken.jwtToken);
    setAccessTokenState(accessToken);
    await setAccessToken(accessToken);
    await setCredentials({ username: email, password });
    return { accessToken };
  };
};

export const useSignup = () => {
  const { setAccessToken: setAccessTokenState } = useUser();
  return async (email: string, password: string) => {
    await apiClient.post(`/auth/signup`, { email, password });
    await setCredentials({ username: email, password });
  };
};

export const passwordCode = async (email: string) => {
  await apiClient.post(`/auth/forgot_password`, { email });

  return;
};

export const confirm_new_password = async (
  email: string,
  verificationCode: string,
  newPassword: string,
) => {
  await apiClient.post(`/auth/confirm_new_password`, {
    email,
    verificationCode,
    newPassword,
  });

  return;
};

export const verifyCode = async (email: string, confirmationCode: string) => {
  const response = await apiClient.post(`/auth/verify`, {
    email,
    confirmationCode,
  });
  if (response.data.message !== "Verification successful") {
    throw new Error(response.data.message);
  }
};

export const getLinkedDevices = async () => {
  const accessToken = await getAccessToken();
  const { devices } = (
    await apiClient.get(`/app/get_linked_devices`, {
      params: { accessToken },
    })
  ).data;
  await setDevices(devices);
  await setDevice(devices[0]);
  return { devices };
};

export const addLinkedAccount = async (deviceId: string, email: string) => {
  const accessToken = await getAccessToken();
  const response = await apiClient.post(`/app/add_linked_account`, {
    accessToken,
    deviceId,
    email,
  });
  return response.data as { linkedUserIds: string[] };
};

export const calibrateUnlocked = async (deviceId: string) => {
  const accessToken = await getAccessToken();
  await apiClient.post(`/app/calibrate_unlocked`, {
    accessToken,
    deviceId,
  });

  return new Promise((resolve, reject) => {
    let i = 0;
    const interval = setInterval(async () => {
      const res = await apiClient.get(`/app/get_status`, {
        params: { accessToken, deviceId },
      });
      if (res.data.isUnlockCalibrated && !res.data.isLockCalibrated) {
        clearInterval(interval);
        resolve(true);
      }
      i++;
      if (i == 100) {
        clearInterval(interval);
        reject(false);
      }
    }, 1000);
  });
};

export const useCalibrateUnlocked = () => {
  const { isCalibrateEnabled } = useFlags();
  if (!isCalibrateEnabled) return placeholderAsyncFunc;
  else return calibrateUnlocked;
};

export const calibrateLocked = async (deviceId: string) => {
  const accessToken = await getAccessToken();
  await apiClient.post(`/app/calibrate_locked`, {
    accessToken,
    deviceId,
  });

  return new Promise((resolve, reject) => {
    let i = 0;
    const interval = setInterval(async () => {
      const res = await apiClient.get(`/app/get_status`, {
        params: { accessToken, deviceId },
      });
      if (res.data.isLockCalibrated) {
        clearInterval(interval);
        resolve(true);
      }
      i++;
      if (i == 100) {
        clearInterval(interval);
        reject(false);
      }
    }, 1000);
  });
};

export const useCalibrateLocked = () => {
  const { isCalibrateEnabled } = useFlags();
  if (!isCalibrateEnabled) return placeholderAsyncFunc;
  else return calibrateLocked;
};

export const lock = async (deviceId: string) => {
  const accessToken = await getAccessToken();
  await apiClient.post(`/app/lock`, { accessToken, deviceId });

  return new Promise((resolve, reject) => {
    let i = 0;
    const interval = setInterval(async () => {
      const res = await apiClient.get(`/app/get_status`, {
        params: { accessToken, deviceId },
      });
      if (res.data.isLocked) {
        clearInterval(interval);
        resolve(true);
      }
      i++;
      if (i == 15) {
        clearInterval(interval);
        reject(false);
      }
    }, 1000);
  });
};

export const useLock = () => {
  const { isLockEnabled } = useFlags();
  if (!isLockEnabled) return placeholderAsyncFunc;
  else return lock;
};

export const unlock = async (deviceId: string) => {
  const accessToken = await getAccessToken();
  await apiClient.post(`/app/unlock`, { accessToken, deviceId });

  return new Promise((resolve, reject) => {
    let i = 0;
    const interval = setInterval(async () => {
      const res = await apiClient.get(`/app/get_status`, {
        params: { accessToken, deviceId },
      });
      if (!res.data.isLocked) {
        clearInterval(interval);
        resolve(true);
      }
      i++;
      if (i == 15) {
        clearInterval(interval);
        reject(false);
      }
    }, 1000);
  });
};

export const useUnlock = () => {
  const { isLockEnabled } = useFlags();
  if (!isLockEnabled) return placeholderAsyncFunc;
  else return unlock;
};

export const getStatus = async (deviceId: string) => {
  const accessToken = await getAccessToken();
  return await apiClient.get(`/app/get_status`, {
    params: { accessToken, deviceId },
  });
};

export const addGuestAccount = async (
  deviceId: string,
  email: string,
  startTime: string,
  expirationTime: string | null,
) => {
  const accessToken = await getAccessToken();
  const response = await apiClient.post(`/app/add_guest_account`, {
    accessToken,
    deviceId,
    email,
    startTime,
    expirationTime,
  });
  return response.data;
};

export const removeUser = async (deviceId: string, email: string) => {
  const accessToken = await getAccessToken();
  const response = await apiClient.post(`/app/remove_user`, {
    accessToken,
    deviceId,
    email,
  });
  return response.data;
};

export const makeOwner = async (deviceId: string, email: string) => {
  const accessToken = await getAccessToken();
  const response = await apiClient.post(`/app/make_owner`, {
    accessToken,
    deviceId,
    email,
  });
  return response.data;
};

export const makeResident = async (deviceId: string, email: string) => {
  const accessToken = await getAccessToken();
  const response = await apiClient.post(`/app/make_resident`, {
    accessToken,
    deviceId,
    email,
  });
  return response.data;
};

export const updateGuestAccess = async (
  deviceId: string,
  email: string,
  startTime: string,
  expirationTime: string | null,
) => {
  const accessToken = await getAccessToken();
  const response = await apiClient.post(`/app/add_guest_account`, {
    accessToken,
    deviceId,
    email,
    startTime,
    expirationTime,
  });
  return response.data;
};

export const placeholderAsyncFunc = async (): Promise<{
  accessToken: string;
}> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ accessToken: "placeholder" });
    }, 1000);
  });
};

const STORAGE_KEY = "lockmate_credentials";

type Credentials = {
  username: string;
  password: string;
};

const isBrowser = () => typeof window !== "undefined";

export const getIdentityVerification = async () => {
  return true;
};

export const getCredentials = async (): Promise<Credentials | null> => {
  if (!isBrowser()) return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Credentials;
  } catch (e) {
    console.error("Failed to get credentials", e);
    return null;
  }
};

export const setCredentials = async (credentials: Credentials) => {
  if (!isBrowser()) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
  } catch (e) {
    console.error("Failed to set credentials", e);
  }
};

export const unsetCredentials = async () => {
  if (!isBrowser()) return;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Failed to unset credentials", e);
  }
};

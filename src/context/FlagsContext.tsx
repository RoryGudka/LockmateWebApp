import React, { useState } from "react";

type ContextProps = {
  isBluetoothEnabled: boolean;
  isAuthEnabled: boolean;
  isCalibrateEnabled: boolean;
  isLockEnabled: boolean;
  isBiometricEnabled: boolean;
};

const FlagsContext = React.createContext<ContextProps>({
  isBluetoothEnabled: false,
  isAuthEnabled: false,
  isCalibrateEnabled: false,
  isLockEnabled: false,
  isBiometricEnabled: false,
});

interface Props {
  children: React.ReactNode;
}

export const FlagsProvider: React.FC<Props> = ({ children }) => {
  const isBluetoothEnabled = true;
  const isAuthEnabled = true;
  const isCalibrateEnabled = true;
  const isLockEnabled = true;
  const isBiometricEnabled = true;

  return (
    <FlagsContext.Provider
      value={{
        isBluetoothEnabled,
        isAuthEnabled,
        isCalibrateEnabled,
        isLockEnabled,
        isBiometricEnabled,
      }}
    >
      {children}
    </FlagsContext.Provider>
  );
};

export function useFlags() {
  return React.useContext(FlagsContext);
}

import React, { useState } from "react";

type ContextProps = {
  network: string | null;
  setNetwork: (network: string) => void;
};

const NetworkContext = React.createContext<ContextProps>({
  network: null,
  setNetwork: () => {},
});

interface Props {
  children: React.ReactNode;
}

export const NetworkProvider: React.FC<Props> = ({ children }) => {
  const [network, setNetwork] = useState<string | null>(null);

  return (
    <NetworkContext.Provider value={{ network, setNetwork }}>
      {children}
    </NetworkContext.Provider>
  );
};

export function useNetwork() {
  return React.useContext(NetworkContext);
}

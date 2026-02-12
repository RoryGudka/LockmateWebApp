import type { AppProps } from "next/app";
import Head from "next/head";

import "../styles/globals.css";

import { BluetoothProvider } from "../context/BluetoothContext";
import { DeviceProvider } from "../context/DeviceContext";
import { FlagsProvider } from "../context/FlagsContext";
import { NetworkProvider } from "../context/NetworkContext";
import { RoutingProvider } from "../context/RoutingContext";
import { UserProvider } from "../context/UserContext";
import { ToastProvider } from "../components/ToastProvider";

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no" />
      </Head>
      <ToastProvider>
        <FlagsProvider>
          <UserProvider>
            <DeviceProvider>
              <BluetoothProvider>
                <NetworkProvider>
                  <RoutingProvider>
                    <Component {...pageProps} />
                  </RoutingProvider>
                </NetworkProvider>
              </BluetoothProvider>
            </DeviceProvider>
          </UserProvider>
        </FlagsProvider>
      </ToastProvider>
    </>
  );
};

export default App;

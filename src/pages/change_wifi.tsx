import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useDevice } from "../context/DeviceContext";
import { useUser } from "../context/UserContext";
import Page from "../components/Page";
import PageWrapper from "../components/PageWrapper";
import Title from "../components/Title";
import Body from "../components/Body";
import Menu from "../components/Menu";
import TextButton from "../components/TextButton";
import TextField from "../components/TextField";
import InlineMessage from "../components/InlineMessage";
import BackButton from "../components/BackButton";
import ConfirmDialog from "../components/ConfirmDialog";
import { ArrowBackOutline } from "../components/icons";
import { palette } from "../theme";
import { getStatus } from "../libs/server";
import { getAccessToken } from "../libs/storage";

const ChangeWiFiPage: React.FC = () => {
  const router = useRouter();
  const { device, setDevice } = useDevice();
  const { accessToken } = useUser();
  const [availableNetworks, setAvailableNetworks] = useState<string[]>([]);
  const [currentNetwork, setCurrentNetwork] = useState<string | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isChanging, setIsChanging] = useState(false);
  const [error, setError] = useState("");
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchNetworks = async () => {
      if (!device?.deviceId) return;
      
      try {
        const response = await getStatus(device.deviceId);
        const status = response.data;
        
        setAvailableNetworks(status.availableNetworks || []);
        setCurrentNetwork(status.connectedNetwork || null);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to load available networks");
        setIsLoading(false);
      }
    };

    fetchNetworks();
  }, [device?.deviceId]);

  const handleNetworkSelect = (network: string) => {
    setSelectedNetwork(network);
    setPassword("");
    setError("");
  };

  const handleBack = () => {
    setSelectedNetwork(null);
    setPassword("");
    setError("");
  };

  const pollForNetworkChange = async (targetNetwork: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const interval = setInterval(async () => {
        try {
          const response = await getStatus(device!.deviceId);
          const status = response.data;
          
          if (status.connectedNetwork === targetNetwork) {
            clearInterval(interval);
            setDevice(status);
            resolve(true);
          }
          
          attempts++;
          if (attempts >= 15) {
            clearInterval(interval);
            reject(false);
          }
        } catch (err) {
          clearInterval(interval);
          reject(false);
        }
      }, 1000);
    });
  };

  const handleChangeWiFi = async () => {
    if (!selectedNetwork || !device?.deviceId) return;

    setIsChanging(true);
    setError("");

    try {
      const token = await getAccessToken();
      const response = await fetch("/api/app/change_wifi_network", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId: device.deviceId,
          networkId: selectedNetwork,
          networkPassword: password,
          accessToken: token,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to change WiFi network");
      }

      // Poll for network change
      await pollForNetworkChange(selectedNetwork);
      
      // Show success page
      setShowSuccess(true);
    } catch (err: any) {
      console.error("WiFi change error:", err);
      setError(err.message || "Failed to change WiFi network. Please try again.");
      setShowErrorDialog(true);
      setIsChanging(false);
    }
  };

  if (isLoading) {
    return (
      <Page>
        <PageWrapper>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "60vh",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                border: "4px solid #f3f3f3",
                borderTop: "4px solid #007AFF",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            <style jsx>{`
              @keyframes spin {
                0% {
                  transform: rotate(0deg);
                }
                100% {
                  transform: rotate(360deg);
                }
              }
            `}</style>
          </div>
        </PageWrapper>
      </Page>
    );
  }

  // Show success page
  if (showSuccess) {
    return (
      <Page>
        <PageWrapper>
          <Title text="WiFi changed successfully" />
          <Body text={`Your Lockmate is now connected to "${selectedNetwork}"`} />
          <Body text="You can continue using your lock as normal" />
          <div style={{ marginTop: "24px" }}>
            <TextButton
              text="Go to home page"
              onClick={() => router.push("/home")}
              variant="contained"
            />
          </div>
        </PageWrapper>
      </Page>
    );
  }

  // Show changing/polling view
  if (isChanging) {
    return (
      <Page>
        <PageWrapper>
          <Title text="Changing WiFi network" />
          <Body text={`Connecting to "${selectedNetwork}"...`} />
          <Body text="This may take up to a minute. Please wait." />
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "32px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                border: "4px solid #f3f3f3",
                borderTop: "4px solid #007AFF",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            <style jsx>{`
              @keyframes spin {
                0% {
                  transform: rotate(0deg);
                }
                100% {
                  transform: rotate(360deg);
                }
              }
            `}</style>
          </div>
        </PageWrapper>
        <ConfirmDialog
          open={showErrorDialog}
          title="Failed to change WiFi"
          message={error || "The WiFi network change timed out. Please check your password and try again."}
          confirmText="OK"
          onConfirm={() => {
            setShowErrorDialog(false);
            setIsChanging(false);
            setSelectedNetwork(null);
          }}
          onCancel={() => {
            setShowErrorDialog(false);
            setIsChanging(false);
            setSelectedNetwork(null);
          }}
        />
      </Page>
    );
  }

  // Show password entry view
  if (selectedNetwork) {
    return (
      <Page>
        <PageWrapper>
          <button
            type="button"
            style={{
              position: "absolute",
              top: "44px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "16px",
              color: palette.blue.main,
              cursor: "pointer",
              background: "transparent",
              border: "none",
              padding: 0,
            }}
            onClick={handleBack}
          >
            <ArrowBackOutline size={18} />
            <p>Back</p>
          </button>
          <Title text="Enter WiFi password" />
          <Body
            text={`Enter the password for "${selectedNetwork}"${
              selectedNetwork === currentNetwork ? " (currently connected)" : ""
            }`}
          />
          
          <InlineMessage text={error} tone="error" />

          <div style={{ marginTop: "24px" }}>
            <TextField
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="WiFi password"
              label="Password"
            />
          </div>

          <div style={{ marginTop: "24px" }}>
            <TextButton
              text="Change WiFi"
              onClick={handleChangeWiFi}
              disabled={!password}
              variant="contained"
            />
          </div>
        </PageWrapper>
      </Page>
    );
  }

  // Show network selection view
  return (
    <Page>
      <PageWrapper>
        <BackButton text="Back" href="/home" />
        <Title text="Change WiFi network" />
        <Body text="Select a new WiFi network for your Lockmate" />
        
        {currentNetwork && (
          <div
            style={{
              marginTop: "16px",
              padding: "12px 16px",
              backgroundColor: palette.blue.light,
              borderRadius: "8px",
              color: palette.blue.main,
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            Currently connected to: {currentNetwork}
          </div>
        )}

        <InlineMessage text={error} tone="error" />

        <Menu
          title="Available networks"
          items={availableNetworks.map((network) => ({
            text: network,
            onClick: () => handleNetworkSelect(network),
          }))}
          isLoading={false}
        />

        {availableNetworks.length === 0 && (
          <Body text="No networks found. Make sure your Lockmate is powered on and within range of WiFi networks." />
        )}
      </PageWrapper>
    </Page>
  );
};

export default ChangeWiFiPage;

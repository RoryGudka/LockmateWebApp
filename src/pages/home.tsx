import { getStatus, useLock, useUnlock } from "../libs/server";
import { useEffect, useState } from "react";

import BatteryIndicator from "../components/BatteryIndicator";
import BottomWrapper from "../components/BottomWrapper";
import CircularButton from "../components/CircularButton";
import ConfirmDialog from "../components/ConfirmDialog";
import InlineMessage from "../components/InlineMessage";
import Menu from "../components/Menu";
import Page from "../components/Page";
import PageWrapper from "../components/PageWrapper";
import Title from "../components/Title";
import { useDevice } from "../context/DeviceContext";
import { useUser } from "../context/UserContext";
import { useRouter } from "next/router";

type ConfirmAction = "signout" | null;

const HomePage: React.FC = () => {
  const router = useRouter();
  const { device, setDevice } = useDevice();
  const { userId, userEmail } = useUser();
  const [isLocked, setIsLocked] = useState(!!device?.isLocked);
  const [error, setError] = useState("");
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const lock = useLock();
  const unlock = useUnlock();

  useEffect(() => {
    if (!device?.deviceId) return;
    if (router.pathname.startsWith("/home")) {
      const interval = setInterval(async () => {
        const status = (await getStatus(device.deviceId)).data;
        console.log("Polled device status:", status);
        setIsLocked(status.isLocked);
        if (status) setDevice(status);
      }, 1000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [router.pathname, device?.deviceId, setDevice]);

  const handleToggleLock = async () => {
    if (!device?.deviceId) {
      setError("No device available. Please reconnect your Lockmate.");
      return;
    }
    try {
      setError("");
      if (isLocked) {
        await unlock(device.deviceId);
        setIsLocked(false);
      } else {
        await lock(device.deviceId);
        setIsLocked(true);
      }
    } catch (e) {
      setError(isLocked ? "Failed to unlock." : "Failed to lock.");
    }
  };

  const handleConfirm = () => {
    if (confirmAction === "signout") {
      router.push("/login");
    }
    setConfirmAction(null);
  };

  // Check if user is a guest
  console.log("Current userId:", userId);
  console.log("Current userEmail:", userEmail);
  console.log("Device guests:", device?.guests);
  console.log("Device linkedUserIds:", device?.linkedUserIds);
  console.log("Device ownerId:", device?.ownerId);
  
  const isGuest = device?.guests?.some((guest: any) => guest.email === userEmail);
  console.log("Is guest?", isGuest);
  
  // Build menu items based on user role
  const menuItems = [
    {
      text: "Recalibrate Lockmate",
      onClick: () => router.push("/calibrate_unlocked"),
    },
    {
      text: "Change WiFi connection",
      onClick: () => router.push("/network_select"),
    },
  ];

  // Only show "Manage allowed users" if not a guest
  if (!isGuest) {
    menuItems.push({
      text: "Manage allowed users",
      onClick: () => router.push("/manage_users"),
    });
  }

  menuItems.push({
    text: "Sign out",
    onClick: () => setConfirmAction("signout"),
  });

  return (
    <Page>
      <PageWrapper>
        <Title
          text={`Your door is currently ${isLocked ? "locked" : "unlocked"}`}
        />
        <InlineMessage text={error} tone="error" />
        <Menu
          title="Device and account options"
          items={menuItems}
        />

        <BatteryIndicator percent={100} />
      </PageWrapper>
      <BottomWrapper>
        <CircularButton
          text={isLocked ? "Unlock" : "Lock"}
          onClick={handleToggleLock}
        />
      </BottomWrapper>
      <ConfirmDialog
        open={confirmAction !== null}
        title="Sign out?"
        message="You will need to sign back in to control your lock."
        confirmText="Sign out"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />
    </Page>
  );
};

export default HomePage;

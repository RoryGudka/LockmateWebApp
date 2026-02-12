import Body from "../components/Body";
import BottomWrapper from "../components/BottomWrapper";
import CircularButton from "../components/CircularButton";
import InlineMessage from "../components/InlineMessage";
import Page from "../components/Page";
import PageWrapper from "../components/PageWrapper";
import Title from "../components/Title";
import BackButton from "../components/BackButton";
import { useCalibrateUnlocked } from "../libs/server";
import { useDevice } from "../context/DeviceContext";
import { useRouter } from "next/router";
import { useState } from "react";

const CalibrateUnlockedPage: React.FC = () => {
  const router = useRouter();
  const calibrateUnlocked = useCalibrateUnlocked();
  const { device } = useDevice();
  const [error, setError] = useState("");
  const isRecalibrate = router.query.recalibrate === "true";

  const handleCalibrate = async () => {
    try {
      setError("");
      await calibrateUnlocked(device!.deviceId);
      router.push("/calibrate_locked");
    } catch (e) {
      setError("Failed to calibrate unlocked position. Please try again.");
    }
  };

  return (
    <Page>
      <PageWrapper>
        {isRecalibrate && <BackButton text="Back" href="/home" />}
        <Title text="Calibrate unlocked position" />
        <Body text="Your Lockmate device has been successfully connected to WiFi, now let's calibrate it" />
        <Body text="Rotate the manual lever on your Lockmate controller until your door is in an unlocked position, and then press the button below" />
        <InlineMessage text={error} tone="error" />
      </PageWrapper>
      <BottomWrapper>
        <CircularButton text="Set" onClick={handleCalibrate} />
      </BottomWrapper>
    </Page>
  );
};

export default CalibrateUnlockedPage;

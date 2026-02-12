import Body from "../components/Body";
import BottomWrapper from "../components/BottomWrapper";
import CircularButton from "../components/CircularButton";
import InlineMessage from "../components/InlineMessage";
import Page from "../components/Page";
import PageWrapper from "../components/PageWrapper";
import Title from "../components/Title";
import { useCalibrateLocked } from "../libs/server";
import { useDevice } from "../context/DeviceContext";
import { useRouter } from "next/router";
import { useState } from "react";

const CalibrateLockedPage: React.FC = () => {
  const router = useRouter();
  const calibrateLocked = useCalibrateLocked();
  const { device } = useDevice();
  const [error, setError] = useState("");

  const handleCalibrate = async () => {
    try {
      setError("");
      await calibrateLocked(device!.deviceId);
      router.push("/calibrate_success");
    } catch (e) {
      setError("Failed to calibrate locked position. Please try again.");
    }
  };

  return (
    <Page>
      <PageWrapper>
        <Title text="Calibrate locked position" />
        <Body text="The unlocked position has been successfully calibrated, now let's calibrate the locked position" />
        <Body text="Rotate the manual lever on your Lockmate controller until your door is in a locked position, and then press the button below" />
        <InlineMessage text={error} tone="error" />
      </PageWrapper>
      <BottomWrapper>
        <CircularButton text="Set" onClick={handleCalibrate} />
      </BottomWrapper>
    </Page>
  );
};

export default CalibrateLockedPage;

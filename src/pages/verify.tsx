import { verifyCode } from "../libs/server";
import { useState } from "react";

import BottomWrapper from "../components/BottomWrapper";
import InlineMessage from "../components/InlineMessage";
import Page from "../components/Page";
import PageWrapper from "../components/PageWrapper";
import TextButton from "../components/TextButton";
import TextField from "../components/TextField";
import Title from "../components/Title";
import { useRouter } from "next/router";
import { useToast } from "../components/ToastProvider";

const CodeVerificationPage: React.FC = () => {
  const router = useRouter();
  const email =
    typeof router.query.email === "string" ? router.query.email : "";
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const { showToast } = useToast();

  const handleVerify = async () => {
    setError("");
    if (!verificationCode) {
      setError("Please enter a verification code.");
      return;
    }

    try {
      await verifyCode(email, verificationCode);
      showToast({
        title: "Email verified",
        description: "You can sign in now.",
        tone: "success",
      });
      router.push("/login");
    } catch (error) {
      setError("Failed to verify code. Please try again.");
    }
  };

  return (
    <Page>
      <PageWrapper>
        <Title text="Code sent to Email" />
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <TextField
            value={email}
            onChange={() => null}
            placeholder="Email address"
            disabled={true}
          />
          <TextField
            value={verificationCode}
            onChange={(e: any) => setVerificationCode(e.target.value)}
            placeholder="Verification Code"
            type="code"
            onKeyDown={(event: any) => {
              if (event.key === "Enter") handleVerify();
            }}
          />
        </div>
        <InlineMessage text={error} tone="error" />
        <div style={{ marginTop: "16px" }}>
          <TextButton
            text="Verify"
            onClick={handleVerify}
            disabled={!verificationCode}
            variant="contained"
          />
        </div>
      </PageWrapper>
      <BottomWrapper>
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            justifyContent: "center",
          }}
        ></div>
      </BottomWrapper>
    </Page>
  );
};

export default CodeVerificationPage;

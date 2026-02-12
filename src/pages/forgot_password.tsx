import { passwordCode } from "../libs/server";

import BottomWrapper from "../components/BottomWrapper";
import InlineMessage from "../components/InlineMessage";
import Page from "../components/Page";
import PageWrapper from "../components/PageWrapper";
import TextButton from "../components/TextButton";
import TextField from "../components/TextField";
import Title from "../components/Title";
import { useRouter } from "next/router";
import { useState } from "react";

const ForgotPasswordPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleReset = async () => {
    setError("");
    if (!email) {
      setError("Please enter an email.");
      return;
    }

    try {
      await passwordCode(email);
      router.push("/reset_password");
    } catch (e) {
      setError("Reset failed. Please try again.");
    }
  };

  return (
    <Page>
      <PageWrapper>
        <Title text="Reset your password" />
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <TextField
            value={email}
            onChange={(e: any) => setEmail(e.target.value)}
            placeholder="Email address"
            onKeyDown={(event: any) => {
              if (event.key === "Enter") handleReset();
            }}
          />
        </div>
        <InlineMessage text={error} tone="error" />
        <div style={{ marginTop: "16px" }}>
          <TextButton
            text="Send Code"
            onClick={handleReset}
            disabled={!email}
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

export default ForgotPasswordPage;

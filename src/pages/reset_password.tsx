import { confirm_new_password } from "../libs/server";

import BottomWrapper from "../components/BottomWrapper";
import InlineMessage from "../components/InlineMessage";
import Page from "../components/Page";
import PageWrapper from "../components/PageWrapper";
import TextButton from "../components/TextButton";
import TextField from "../components/TextField";
import Title from "../components/Title";
import { useRouter } from "next/router";
import { useState } from "react";
import { useToast } from "../components/ToastProvider";

const ResetPasswordPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { showToast } = useToast();

  const handleReset = async () => {
    setError("");
    if (!email) {
      setError("Please enter an email.");
      return;
    }
    if (!code) {
      setError("Please enter the code sent to your email.");
      return;
    }
    if (!password) {
      setError("Please enter your new password.");
      return;
    }

    try {
      await confirm_new_password(email, code, password);
      showToast({
        title: "Password reset",
        description: "You can sign in with your new password.",
        tone: "success",
      });
      router.push("/login");
    } catch (e) {
      setError("Password reset failed. Please check the code and try again.");
    }
  };

  return (
    <Page>
      <PageWrapper>
        <Title text="Code sent to Email, Reset" />
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <TextField
            value={email}
            onChange={(e: any) => setEmail(e.target.value)}
            placeholder="Email address"
          />
          <TextField
            value={code}
            onChange={(e: any) => setCode(e.target.value)}
            placeholder="Verification Code"
            type="code"
          />
          <TextField
            value={password}
            onChange={(e: any) => setPassword(e.target.value)}
            placeholder="New Password"
            type="password"
            onKeyDown={(event: any) => {
              if (event.key === "Enter") handleReset();
            }}
          />
        </div>
        <InlineMessage text={error} tone="error" />
        <div style={{ marginTop: "16px" }}>
          <TextButton
            text="Reset"
            onClick={handleReset}
            disabled={!email || !code || !password}
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

export default ResetPasswordPage;

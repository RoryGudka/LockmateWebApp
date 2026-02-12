import { getLinkedDevices, useLogin } from "../libs/server";

import BottomWrapper from "../components/BottomWrapper";
import InlineMessage from "../components/InlineMessage";
import Page from "../components/Page";
import PageWrapper from "../components/PageWrapper";
import TextButton from "../components/TextButton";
import TextField from "../components/TextField";
import Title from "../components/Title";
import { useReroute } from "../context/RoutingContext";
import { useRouter } from "next/router";
import { useState } from "react";

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const login = useLogin();
  const { reroute } = useReroute();

  const handleLogin = async () => {
    setError("");
    if (!email) {
      setError("Please enter an email.");
      return;
    }

    if (!password) {
      setError("Please enter a password.");
      return;
    }

    try {
      await login(email, password);
      await getLinkedDevices();
      await reroute();
    } catch (e) {
      setError("Login failed. Please check your email and password.");
    }
  };

  return (
    <Page>
      <PageWrapper>
        <Title text="Sign in to Lockmate" />
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <TextField
            value={email}
            onChange={(e: any) => setEmail(e.target.value)}
            placeholder="Email address"
          />
          <TextField
            value={password}
            onChange={(e: any) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            onKeyDown={(event: any) => {
              if (event.key === "Enter") handleLogin();
            }}
          />
        </div>
        <InlineMessage text={error} tone="error" />
        <div style={{ marginTop: "16px" }}>
          <TextButton
            text="Sign in"
            onClick={handleLogin}
            disabled={!email || !password}
            variant="contained"
          />
        </div>
        <div style={{ marginTop: "12px" }}>
          <TextButton
            text="Forgot password"
            onClick={() => router.push("/forgot_password")}
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
        >
          Don't have an account?
          <TextButton text="Sign up" onClick={() => router.push("/signup")} />
        </div>
      </BottomWrapper>
    </Page>
  );
};

export default LoginPage;

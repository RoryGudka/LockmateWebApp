import { useSignup } from "../libs/server";
import { useRef, useState } from "react";

import BottomWrapper from "../components/BottomWrapper";
import InlineMessage from "../components/InlineMessage";
import Page from "../components/Page";
import PageWrapper from "../components/PageWrapper";
import TextButton from "../components/TextButton";
import TextField from "../components/TextField";
import Title from "../components/Title";
import { useRouter } from "next/router";

const SignupPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const [error, setError] = useState("");
  const checkboxRef = useRef<any>();
  const signup = useSignup();
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

    if (password !== confirmedPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!checkboxRef.current.checked) {
      setError("Please agree to the terms of service and privacy policy.");
      return;
    }

    try {
      await signup(email, password);
      router.push(`/verify?email=${email}`);
    } catch (e: any) {
      setError(
        e?.response?.data ||
          "Signup failed. Please check your details and try again.",
      );
    }
  };

  return (
    <Page>
      <PageWrapper>
        <Title text="Create an account" />
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
          />
          <TextField
            value={confirmedPassword}
            onChange={(e: any) => setConfirmedPassword(e.target.value)}
            placeholder="Confirm password"
            type="password"
            onKeyDown={(event: any) => {
              if (event.key === "Enter") handleLogin();
            }}
          />
          <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
            <input
              ref={checkboxRef}
              type="checkbox"
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "6px",
              }}
            />
            <span style={{ textAlign: "left", fontSize: "14px" }}>
              I agree to Lockmate's <u>terms of service</u> and{" "}
              <u>privacy policy</u>
            </span>
          </div>
        </div>
        <InlineMessage text={error} tone="error" />
        <div style={{ marginTop: "16px" }}>
          <TextButton
            text="Create account"
            onClick={handleLogin}
            disabled={!email || !password || !confirmedPassword}
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
        >
          Already have an account?
          <TextButton text="Sign in" onClick={() => router.push("/login")} />
        </div>
      </BottomWrapper>
    </Page>
  );
};

export default SignupPage;

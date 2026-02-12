import BackButton from "../components/BackButton";
import InlineMessage from "../components/InlineMessage";
import Page from "../components/Page";
import PageWrapper from "../components/PageWrapper";
import TextButton from "../components/TextButton";
import TextField from "../components/TextField";
import Title from "../components/Title";
import { useNetwork } from "../context/NetworkContext";
import { useRouter } from "next/router";
import { useState } from "react";

const NetworkNamePage: React.FC = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const { setNetwork } = useNetwork();

  const handleJoinNetwork = async () => {
    setError("");
    if (!name) {
      setError("Please enter a network name.");
      return;
    }
    setNetwork(name);
    router.push("/network_password");
  };

  return (
    <Page>
      <PageWrapper>
        <BackButton text="Back" href="/network_select" />
        <Title text="Enter network name" />
        <TextField
          value={name}
          onChange={(e: any) =>
            setName(e.target.value.replace("â€˜", "'").replace("â€™", "'"))
          }
          placeholder="Name"
          onKeyDown={(event: any) => {
            if (event.key === "Enter") handleJoinNetwork();
          }}
        />
        <InlineMessage text={error} tone="error" />
        <div style={{ marginTop: "16px" }}>
          <TextButton
            text="Next"
            onClick={handleJoinNetwork}
            disabled={!name}
            variant="contained"
          />
        </div>
      </PageWrapper>
    </Page>
  );
};

export default NetworkNamePage;

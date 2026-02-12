import Body from "../components/Body";
import Menu from "../components/Menu";
import MenuItem from "../components/MenuItem";
import Page from "../components/Page";
import PageWrapper from "../components/PageWrapper";
import Title from "../components/Title";
import { palette } from "../theme";
import { useBluetooth } from "../context/BluetoothContext";
import { useGetNetworks } from "../libs/bluetooth";
import { useNetwork } from "../context/NetworkContext";
import { useRouter } from "next/router";

const NetworkSelectPage: React.FC = () => {
  const router = useRouter();
  const { bleDevice } = useBluetooth();
  const networks = useGetNetworks(bleDevice!);
  const { setNetwork } = useNetwork();

  return (
    <Page>
      <PageWrapper>
        <Title text="Lockmate connected" />
        <Body text="Your Lockmate has been successfully connected, now let's set up a WiFi connection so you can control your lock from anywhere at anytime" />
        <Body text="Select a WiFi network to begin" />
        <Menu
          title="Networks found"
          items={networks.map((name) => ({
            text: name,
            onClick: () => {
              setNetwork(name);
              router.push(`/network_password`);
            },
          }))}
          isLoading={!networks.length}
          loadingText="Searching for networks"
        />
        {!!networks.length && (
          <div
            style={{
              marginTop: "16px",
              textAlign: "left",
              backgroundColor: palette.gray.main,
              borderRadius: "8px",
              overflowY: "auto",
              maxHeight: "240px",
            }}
          >
            <MenuItem
              text="Select other network"
              onClick={() => router.push("/network_name")}
              hasBorder={false}
            />
          </div>
        )}
      </PageWrapper>
    </Page>
  );
};

export default NetworkSelectPage;

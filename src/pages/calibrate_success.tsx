import Body from "../components/Body";
import Page from "../components/Page";
import PageWrapper from "../components/PageWrapper";
import TextButton from "../components/TextButton";
import Title from "../components/Title";
import { useRouter } from "next/router";

const CalibrateSuccessPage: React.FC = () => {
  const router = useRouter();

  return (
    <Page>
      <PageWrapper>
        <Title text="You're all set" />
        <Body text="Your Lockmate has been successfully calibrated, and you're ready to test it out for real" />
        <Body text="Press the button below to go to the home page and give it a spin" />
        <div style={{ marginTop: "16px" }}>
          <TextButton
            text="Go to home page"
            onClick={() => router.push("/home")}
            variant="contained"
          />
        </div>
      </PageWrapper>
    </Page>
  );
};

export default CalibrateSuccessPage;

import Body from "../components/Body";
import Page from "../components/Page";
import PageWrapper from "../components/PageWrapper";
import Title from "../components/Title";

const CalibrateUnlockedPage: React.FC = () => {
  return (
    <Page>
      <PageWrapper>
        <Title text="Network connected" />
        <Body text="Your Lockmate has been successfully connected to the internet, now let's calibrate your lock" />
      </PageWrapper>
    </Page>
  );
};

export default CalibrateUnlockedPage;

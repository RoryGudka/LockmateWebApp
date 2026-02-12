interface ContainerProps {
  children: React.ReactNode;
}

const Page: React.FC<ContainerProps> = ({ children }) => {
  return (
    <div
      style={{
        minHeight: "100dvh",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {children}
    </div>
  );
};

export default Page;

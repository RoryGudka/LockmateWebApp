interface ContainerProps {
  children: React.ReactNode;
}

const BottomWrapper: React.FC<ContainerProps> = ({ children }) => {
  return (
    <div
      style={{
        padding: "40px",
        paddingTop: "0px",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        marginTop: "auto",
      }}
    >
      {children}
    </div>
  );
};

export default BottomWrapper;

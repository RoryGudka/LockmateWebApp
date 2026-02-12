interface ContainerProps {
  text: string;
}

const Title: React.FC<ContainerProps> = ({ text }) => {
  return (
    <h1
      style={{
        fontSize: "32px",
        fontWeight: 700,
        marginTop: "40px",
        marginBottom: "32px",
      }}
    >
      {text}
    </h1>
  );
};

export default Title;

interface ContainerProps {
  text: string;
}

const Body: React.FC<ContainerProps> = ({ text }) => {
  return <p style={{ marginBottom: "24px" }}>{text}</p>;
};

export default Body;

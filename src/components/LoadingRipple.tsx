interface ContainerProps {}

const LoadingRipple: React.FC<ContainerProps> = ({}) => {
  return (
    <div className="lds-ripple">
      <div></div>
      <div></div>
    </div>
  );
};

export default LoadingRipple;

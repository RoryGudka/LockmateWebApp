interface ContainerProps {}

const LoadingSpinner: React.FC<ContainerProps> = ({}) => {
  return (
    <span style={{ position: "relative", width: "24px", height: "24px" }}>
      <span style={{ position: "absolute", top: "-32px", left: "-27px" }}>
        <span style={{ display: "flex" }}>
          <span style={{ transform: "scale(0.25)" }}>
            <div>
              <div className="lds-spinner">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
            </div>
          </span>
        </span>
      </span>
    </span>
  );
};

export default LoadingSpinner;

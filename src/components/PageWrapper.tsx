import React, { ReactNode } from "react";

import { palette } from "../theme";

interface ContainerProps {
  children: ReactNode;
}

const PageWrapper: React.FC<ContainerProps> = ({ children }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        maxWidth: "480px",
        margin: "0 auto",
        padding: "32px",
        paddingTop: "64px",
        fontFamily: "'DM Sans', sans-serif",
        color: palette.text.main,
        fontSize: "18px",
        fontWeight: 400,
        lineHeight: "1.3",
        textAlign: "center",
        backgroundColor: "white",
      }}
    >
      {children}
    </div>
  );
};

export default PageWrapper;

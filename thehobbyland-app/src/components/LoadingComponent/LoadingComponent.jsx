import { Alert, Spin } from "antd";
import React from "react";

const LoadingComponent = ({ children, isLoading, delay = 200 }) => {
  return (
    <Spin spinning={isLoading} delay={delay}>
      {/* <Alert
        type="info"
        message="Alert message title"
        description="Further details about the context of this alert."
      /> */}
      {children}
    </Spin>
  );
};

export default LoadingComponent;

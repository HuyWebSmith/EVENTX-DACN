import React from "react";
import HeaderComponent from "../HeaderComponent/HeaderComponent";

const DefaultComponent = ({ children }) => {
  return (
    <div>
      <HeaderComponent />

      {/* Đẩy nội dung xuống dưới tránh bị header che */}
      <div>{children}</div>
    </div>
  );
};

export default DefaultComponent;

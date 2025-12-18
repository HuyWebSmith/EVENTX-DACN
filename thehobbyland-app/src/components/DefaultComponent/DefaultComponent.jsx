import React from "react";
import HeaderComponent from "../HeaderComponent/HeaderComponent";
import Footer from "../Footer/Footer";

const DefaultComponent = ({ children }) => {
  return (
    <div>
      <HeaderComponent />

      {/* Đẩy nội dung xuống dưới tránh bị header che */}
      <div>{children}</div>
      <Footer></Footer>
    </div>
  );
};

export default DefaultComponent;

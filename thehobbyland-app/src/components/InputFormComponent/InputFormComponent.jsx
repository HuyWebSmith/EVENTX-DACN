import React from "react";
import { WrapperInputStyle } from "./style";
const InputFormComponent = (props) => {
  const { placeholder = "Nhập text", onChange, value, ...rests } = props;

  const handleChange = (e) => {
    if (typeof onChange === "function") {
      onChange(e.target.value);
    }
  };

  return (
    <>
      <WrapperInputStyle
        aria-label=""
        placeholder={placeholder}
        value={props.value}
        {...rests}
        onChange={handleChange}
      >
        {/* <EyeOutlined />
        <EyeInvisibleOutlined /> */}
      </WrapperInputStyle>
    </>
  );
};

export default InputFormComponent;

import React from "react";
import { Input } from "antd";
const inputComponent = ({ size, placeholder, style, ...rests }) => {
  return (
    <Input size={size} placeholder={placeholder} style={style} {...rests} />
  );
};

export default inputComponent;

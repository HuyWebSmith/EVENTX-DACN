import React from "react";
import { Button } from "antd";

const ButtonComponent = ({
  size,
  onClick,
  styleButton = {},
  styleTextButton = {},
  textButton,
  icon,
  disabled,
  ...rests
}) => {
  return (
    <Button
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      size={size}
      icon={icon}
      style={{
        ...styleButton,
        background: disabled ? "#ccc" : styleButton.background,
        color: styleButton.color,
        borderRadius: styleButton.borderRadius || 0,
        border: styleButton.border || "none",
      }}
      {...rests}
    >
      <span style={styleTextButton}>{textButton}</span>
    </Button>
  );
};

export default ButtonComponent;

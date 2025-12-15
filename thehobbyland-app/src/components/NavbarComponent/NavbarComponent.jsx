import React from "react";
import {
  WrapperLableText,
  WrapperTextValue,
  WrapperContent,
  WrapperTextPrice,
} from "./style";
import { Checkbox, Rate } from "antd";
const NavbarComponent = () => {
  const onChange = (checkedValues) => {
    console.log("checked = ", checkedValues);
  };
  const renderContent = (type, options) => {
    switch (type) {
      case "text":
        return options.map((option, index) => {
          return <WrapperTextValue key={index}>{option}</WrapperTextValue>;
        });
      case "checkbox":
        return (
          <Checkbox.Group
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
            onChange={onChange}
          >
            {options.map((option, index) => {
              return (
                <Checkbox
                  key={option.value || index}
                  style={{ marginLeft: 0 }}
                  value={option.value}
                >
                  {option.label}
                </Checkbox>
              );
            })}
          </Checkbox.Group>
        );
      case "star":
        return options.map((option, index) => {
          return (
            <div
              key={option}
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <Rate
                style={{ fontSize: "12px" }}
                disabled
                defaultValue={option}
              />
              <span>{`Từ ${option} sao`}</span>
            </div>
          );
        });
      case "price":
        return options.map((option, index) => {
          return <WrapperTextPrice key={index}>{option}</WrapperTextPrice>;
        });
      default:
        return null;
    }
  };

  return (
    <div>
      <WrapperLableText>Label</WrapperLableText>
      <WrapperContent>
        {renderContent("text", [`Tu lanh`, `Manga`, `Anime`])}
      </WrapperContent>
      <WrapperContent>
        {renderContent("checkbox", [
          { label: "A", value: "a" },
          { label: "B", value: "a" },
        ])}
      </WrapperContent>
      <WrapperContent>{renderContent("star", [3, 4, 5])}</WrapperContent>
      <WrapperContent>
        {renderContent("price", ["Dưới 40.000đ", "Trên 50.000đ"])}
      </WrapperContent>
    </div>
  );
};

export default NavbarComponent;

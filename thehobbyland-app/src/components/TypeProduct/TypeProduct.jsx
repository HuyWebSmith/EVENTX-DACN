import React from "react";
import { CategoryItem, TypeItem } from "./style";

const TypeProduct = ({ name, onClick }) => {
  return (
    <CategoryItem onClick={onClick} style={{ cursor: "pointer" }}>
      {name}
    </CategoryItem>
  );
};

export default TypeProduct;

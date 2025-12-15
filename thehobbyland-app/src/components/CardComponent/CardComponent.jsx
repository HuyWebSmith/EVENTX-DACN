// File: src/components/CardComponent/CardComponent.jsx

import React from "react";
import {
  WrapperCardStyle,
  StyleNameProduct,
  WrapperPriceText,
  WrapperReportText,
} from "./style";
import { CalendarOutlined } from "@ant-design/icons";
const CardComponent = (props) => {
  const { title, eventDate, price, image, logo, address, tickets = [] } = props;

  const formattedPrice = price
    ? `Từ ${price.toLocaleString("vi-VN")}đ`
    : "Liên hệ";

  const defaultAddress =
    "53/104 Trần Khánh Dư, Tân Định, Quận 1, HCMC (Địa chỉ mặc định)";

  const cheapestPrice =
    tickets.length > 0 ? Math.min(...tickets.map((t) => t.price)) : 0;
  return (
    <WrapperCardStyle
      hoverable
      style={{
        width: 300,
        backgroundColor: "#2e2e2e",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
      }}
      cover={
        <div style={{ position: "relative", width: "100%", height: "200px" }}>
          <img
            draggable={false}
            alt={title}
            src={
              image ||
              "https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png"
            }
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          {/* Logo/Banner nhỏ "BY DE GARDEN" */}
          <img
            alt="logo"
            src={logo}
            style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              width: "60px",
              height: "auto",
              borderRadius: "3px",
              backgroundColor: "rgba(0,0,0,0.4)",
              padding: "5px 8px",
              zIndex: 1,
            }}
          />
          {/* Địa chỉ - Đã chuyển sang sử dụng prop 'address' */}
          <span
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              color: "#fff",
              fontSize: "10px",
              backgroundColor: "rgba(0,0,0,0.5)",
              padding: "2px 5px",
              borderRadius: "3px",
            }}
          >
            {address}
          </span>
        </div>
      }
    >
      {/* Phần Body của Card */}
      <div style={{ padding: "10px 15px", color: "#fff" }}>
        <StyleNameProduct
          style={{
            fontSize: "18px",
            fontWeight: "bold",
            marginBottom: "10px",
            color: "#fff",
            height: "48px", // 2 dòng * 24px mỗi dòng
            lineHeight: "24px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {title}
        </StyleNameProduct>

        <WrapperPriceText
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            color: "#37B75A",
            marginBottom: "5px",
          }}
        >
          {formattedPrice}
        </WrapperPriceText>

        <WrapperReportText
          style={{
            fontSize: "14px",
            color: "#ccc",
            display: "flex",
            alignItems: "center",
          }}
        >
          <span style={{ marginRight: "5px" }}>
            <CalendarOutlined
              style={{
                fontSize: "15px",
                fontWeight: "bold",
                color: "#37B75A",
                marginBottom: "5px",
              }}
            />
          </span>
          {new Date(eventDate).toLocaleDateString("vi-VN")}
        </WrapperReportText>

        {/* BỎ KHỐI HIỂN THỊ CATEGORYNAME Ở ĐÂY */}
      </div>
    </WrapperCardStyle>
  );
};

export default CardComponent;

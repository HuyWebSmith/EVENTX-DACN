// File: src/components/CardComponent/CardComponent.jsx

import React, { useState } from "react";
import {
  WrapperCardStyle,
  StyleNameProduct,
  WrapperPriceText,
  WrapperReportText,
} from "./style";
import { CalendarOutlined, EnvironmentOutlined } from "@ant-design/icons";

const CardComponent = (props) => {
  const { title, eventDate, price, image, logo, address, tickets = [] } = props;

  const cityName =
    address
      ?.toString()
      .replace(/Thành phố|TP\.|TP/gi, "")
      .trim() || "Địa điểm";
  const [isHovered, setIsHovered] = useState(false);

  const formattedPrice = price
    ? `Từ ${price.toLocaleString("vi-VN")}đ`
    : "Liên hệ";

  const styles = {
    cardContainer: {
      width: 300,

      background: "linear-gradient(145deg, #2e2e2e, #1a1a1a)",
      borderRadius: "16px",
      overflow: "hidden",
      border: "1px solid rgba(255, 255, 255, 0.08)",

      boxShadow: isHovered
        ? "0 20px 30px rgba(0, 0, 0, 0.4), 0 8px 12px rgba(0, 0, 0, 0.2)"
        : "0 10px 20px rgba(0, 0, 0, 0.3), 0 4px 6px rgba(0, 0, 0, 0.1)",
      transition: "all 0.3s ease-in-out",
      cursor: "pointer",
    },
    imageContainer: {
      position: "relative",
      width: "100%",
      height: "200px",
      overflow: "hidden",
    },
    mainImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      transition: "transform 0.5s ease",
      // Hiệu ứng zoom nhẹ khi hover
      transform: isHovered ? "scale(1.05)" : "scale(1.0)",
    },

    imageOverlay: {
      position: "absolute",
      bottom: 0,
      left: 0,
      width: "100%",
      height: "50%",
      background: "linear-gradient(to top, rgba(26,26,26,0.9), transparent)",
      zIndex: 1,
    },

    glassBadge: {
      position: "absolute",
      padding: "6px 10px",
      borderRadius: "8px",

      backgroundColor: "rgba(0, 0, 0, 0.3)",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      zIndex: 2,
      color: "#fff",
      fontSize: "11px",
      fontWeight: "500",
      display: "flex",
      alignItems: "center",
      gap: "4px",
    },
    cardBody: {
      padding: "20px",
      position: "relative",
      zIndex: 2,
    },
    title: {
      fontSize: "18px",
      fontWeight: "700",
      marginBottom: "12px",
      color: "#fff",
      height: "54px",
      lineHeight: "27px",
      overflow: "hidden",
      textOverflow: "ellipsis",
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",

      textShadow: "0 2px 4px rgba(0,0,0,0.5)",
    },
    price: {
      fontSize: "22px",
      fontWeight: "800",
      color: "#37B75A",
      marginBottom: "12px",
      letterSpacing: "0.5px",
      textShadow: "0 0 10px rgba(55, 183, 90, 0.3)",
    },
    dateRow: {
      fontSize: "14px",
      color: "#ccc",
      display: "flex",
      alignItems: "center",
      fontWeight: "500",
    },
    iconStyle: {
      fontSize: "16px",
      color: "#37B75A", // Icon cùng màu với giá
      marginRight: "8px",
    },
  };
  // --------------------------------------

  return (
    <WrapperCardStyle
      hoverable={false} // Tắt hover mặc định của Antd để dùng custom hover
      style={styles.cardContainer}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      cover={
        <div style={styles.imageContainer}>
          <img
            draggable={false}
            alt={title}
            src={
              image ||
              "https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png"
            }
            style={styles.mainImage}
          />
          {/* Lớp phủ gradient để chuyển tiếp mượt xuống phần thân */}
          <div style={styles.imageOverlay}></div>

          {/* Logo Badge - Glassmorphism */}
          {logo && (
            <img
              alt="logo"
              src={logo}
              style={{
                ...styles.glassBadge,
                top: "12px",
                left: "12px",
                width: "auto",
                height: "32px", // Cố định chiều cao logo
                padding: "4px 8px",
              }}
            />
          )}

          {/* Address Badge - Glassmorphism */}
          {address && (
            <div
              style={{
                ...styles.glassBadge,
                top: "12px",
                right: "12px",
                maxWidth: "150px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              <EnvironmentOutlined style={{ fontSize: "12px" }} />
              {cityName}
            </div>
          )}
        </div>
      }
    >
      {/* Phần Body của Card */}
      <div style={styles.cardBody}>
        <StyleNameProduct style={styles.title}>{title}</StyleNameProduct>

        <WrapperPriceText style={styles.price}>
          {formattedPrice}
        </WrapperPriceText>

        <WrapperReportText style={styles.dateRow}>
          <CalendarOutlined style={styles.iconStyle} />
          {`${cityName}, ${new Date(eventDate).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}`}
        </WrapperReportText>
      </div>
    </WrapperCardStyle>
  );
};

export default CardComponent;

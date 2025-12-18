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
  // State để xử lý hover effect thủ công nếu cần
  const [isHovered, setIsHovered] = useState(false);

  const formattedPrice = price
    ? `Từ ${price.toLocaleString("vi-VN")}đ`
    : "Liên hệ";

  // --- DEFINING NEW LUXURY STYLES ---
  const styles = {
    cardContainer: {
      width: 300,
      // Gradient nền tối tạo chiều sâu thay vì màu phẳng
      background: "linear-gradient(145deg, #2e2e2e, #1a1a1a)",
      borderRadius: "16px", // Bo góc mềm mại hơn
      overflow: "hidden",
      border: "1px solid rgba(255, 255, 255, 0.08)", // Viền mỏng bắt sáng
      // Đổ bóng nhiều lớp tạo cảm giác nổi 3D cao cấp
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
    // Lớp phủ gradient lên ảnh để làm nổi bật text trắng
    imageOverlay: {
      position: "absolute",
      bottom: 0,
      left: 0,
      width: "100%",
      height: "50%",
      background: "linear-gradient(to top, rgba(26,26,26,0.9), transparent)",
      zIndex: 1,
    },
    // Hiệu ứng kính (Glassmorphism) cho các nhãn
    glassBadge: {
      position: "absolute",
      padding: "6px 10px",
      borderRadius: "8px",
      // Kỹ thuật tạo hiệu ứng kính mờ
      backgroundColor: "rgba(0, 0, 0, 0.3)", // Nền đen bán trong suốt
      backdropFilter: "blur(8px)", // Làm mờ hậu cảnh
      WebkitBackdropFilter: "blur(8px)", // Hỗ trợ Safari
      border: "1px solid rgba(255, 255, 255, 0.1)", // Viền kính
      zIndex: 2,
      color: "#fff",
      fontSize: "11px",
      fontWeight: "500",
      display: "flex",
      alignItems: "center",
      gap: "4px",
    },
    cardBody: {
      padding: "20px", // Tăng padding cho thoáng
      color: "#fff",
      position: "relative",
      zIndex: 2,
    },
    title: {
      fontSize: "18px",
      fontWeight: "700", // Đậm hơn chút
      marginBottom: "12px",
      color: "#fff",
      height: "54px", // Điều chỉnh chiều cao cho 2 dòng thoáng hơn
      lineHeight: "27px", // Tăng line-height
      overflow: "hidden",
      textOverflow: "ellipsis",
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
      // Text shadow nhẹ để chữ nổi lên nền tối
      textShadow: "0 2px 4px rgba(0,0,0,0.5)",
    },
    price: {
      fontSize: "22px", // To hơn
      fontWeight: "800", // Rất đậm
      color: "#37B75A", // Giữ màu xanh thương hiệu (hoặc đổi sang màu Vàng Gold #D4AF37 nếu muốn sang hơn nữa)
      marginBottom: "12px",
      letterSpacing: "0.5px",
      textShadow: "0 0 10px rgba(55, 183, 90, 0.3)", // Hiệu ứng phát sáng nhẹ cho giá
    },
    dateRow: {
      fontSize: "14px",
      color: "#ccc", // Màu xám bạc
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
                maxWidth: "150px", // Giới hạn chiều rộng địa chỉ
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              <EnvironmentOutlined style={{ fontSize: "12px" }} />
              {address}
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
          {new Date(eventDate).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </WrapperReportText>
      </div>
    </WrapperCardStyle>
  );
};

export default CardComponent;

import React from "react";
import { Row, Col, Typography, Space } from "antd";
import {
  FacebookOutlined,
  InstagramOutlined,
  YoutubeOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { WrapperContainer, FooterLink, FooterTitle } from "./style";
import LogoImage from "../../assets/images/logo_EventX2.png";

const { Text } = Typography;

const Footer = () => {
  return (
    <WrapperContainer>
      <div style={{ width: "1270px", margin: "0 auto", padding: "40px 0" }}>
        <Row gutter={[40, 40]}>
          {/* Cột 1: Logo và Giới thiệu */}
          <Col span={8}>
            <img
              src={LogoImage}
              alt="Logo EventX"
              style={{ width: "180px", marginBottom: "20px" }}
            />
            <div style={{ color: "#fff", opacity: 0.8, lineHeight: "1.8" }}>
              Hệ sinh thái quản lý và tổ chức sự kiện hàng đầu. Mang đến trải
              nghiệm kết nối cộng đồng thông qua các sự kiện đẳng cấp.
            </div>
          </Col>

          {/* Cột 2: Khám phá */}
          <Col span={5}>
            <FooterTitle>Khám phá</FooterTitle>
            <Space direction="vertical">
              <FooterLink href="#">Về EventX</FooterLink>
              <FooterLink href="#">Sự kiện nổi bật</FooterLink>
              <FooterLink href="#">Tin tức</FooterLink>
              <FooterLink href="#">Hợp tác</FooterLink>
            </Space>
          </Col>

          {/* Cột 3: Hỗ trợ */}
          <Col span={5}>
            <FooterTitle>Hỗ trợ</FooterTitle>
            <Space direction="vertical">
              <FooterLink href="#">Trung tâm trợ giúp</FooterLink>
              <FooterLink href="#">Quy định & Chính sách</FooterLink>
              <FooterLink href="#">Quyền riêng tư</FooterLink>
              <FooterLink href="#">Phản hồi lỗi</FooterLink>
            </Space>
          </Col>

          {/* Cột 4: Liên hệ */}
          <Col span={6}>
            <FooterTitle>Liên hệ với chúng tôi</FooterTitle>
            <div style={{ color: "#fff", marginBottom: "10px" }}>
              <MailOutlined /> support@eventx.com
            </div>
            <div style={{ color: "#fff", marginBottom: "20px" }}>
              <PhoneOutlined /> 1900 xxxx
            </div>
            <Space size="large" style={{ fontSize: "24px", color: "#fff" }}>
              <FacebookOutlined className="footer-icon" />
              <InstagramOutlined className="footer-icon" />
              <YoutubeOutlined className="footer-icon" />
            </Space>
          </Col>
        </Row>

        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.1)",
            marginTop: "40px",
            paddingTop: "20px",
            textAlign: "center",
          }}
        >
          <Text style={{ color: "#fff", opacity: 0.6 }}>
            © 2025 EventX Ecosystem. All rights reserved. Designed by QUANG HUY.
          </Text>
        </div>
      </div>
    </WrapperContainer>
  );
};

export default Footer;

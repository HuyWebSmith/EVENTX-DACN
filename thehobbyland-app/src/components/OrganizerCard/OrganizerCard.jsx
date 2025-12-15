import React from "react";
import { Image } from "antd";
import styled from "styled-components";

// ==================== STYLED COMPONENTS ĐẸP HƠN ====================
const OrganizerCardWrapper = styled.div`
  background: linear-gradient(145deg, #1e1e1e, #262626);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;
  max-width: 1240px;
  margin: 20px auto;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 204, 102, 0.15);
  }
`;

const OrganizerTitle = styled.div`
  background: linear-gradient(to right, #00cc66, #00ff80);
  color: #000;
  font-size: 15px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 12px 24px;
  clip-path: polygon(0 0, 100% 0, 95% 100%, 0% 100%);
`;

const OrganizerContent = styled.div`
  display: flex;
  align-items: center;
  padding: 28px 32px;
  gap: 28px;

  @media (max-width: 640px) {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
`;

const LogoWrapper = styled.div`
  flex-shrink: 0;
  width: 140px;
  height: 140px;
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
  padding: 8px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
  border: 3px solid #00cc66;
  transition: transform 0.3s ease;

  ${OrganizerCardWrapper}:hover & {
    transform: scale(1.08);
  }
`;

const OrganizerInfo = styled.div`
  flex: 1;
  color: #e0e0e0;
`;

const OrganizerNameVi = styled.h3`
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 10px 0;
  line-height: 1.2;

  @media (max-width: 640px) {
    font-size: 22px;
  }
`;

const OrganizerNameEn = styled.div`
  font-size: 15px;
  color: #aaaaaa;
  line-height: 1.5;
  font-weight: 400;

  a {
    color: #00cc66;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;

    &:hover {
      color: #00ff80;
      text-decoration: underline;
    }
  }
`;

// ==================== COMPONENT CHÍNH ====================
const OrganizerCard = ({ organizer }) => {
  const { organizerName, organizerInfo, organizerEmail, organizerLogoUrl } =
    organizer || {};

  // Ghép info và email, tự động biến email thành link
  const subTextParts = [];
  if (organizerInfo) subTextParts.push(organizerInfo);
  if (organizerEmail) {
    subTextParts.push(
      <a href={`mailto:${organizerEmail}`} key="email">
        {organizerEmail}
      </a>
    );
  }
  const subText =
    subTextParts.length > 0
      ? subTextParts.reduce((prev, curr) => [prev, " • ", curr])
      : null;

  if (!organizerName) return null;

  return (
    <OrganizerCardWrapper>
      <OrganizerTitle>Ban tổ chức</OrganizerTitle>

      <OrganizerContent>
        {/* Logo */}
        <LogoWrapper>
          <Image
            src={organizerLogoUrl || "/placeholder-logo.png"}
            alt="Logo Ban Tổ Chức"
            preview={false}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
            fallback="/placeholder-logo.png"
          />
        </LogoWrapper>

        {/* Thông tin */}
        <OrganizerInfo>
          <OrganizerNameVi>{organizerName}</OrganizerNameVi>
          {subText && <OrganizerNameEn>{subText}</OrganizerNameEn>}
        </OrganizerInfo>
      </OrganizerContent>
    </OrganizerCardWrapper>
  );
};

export default OrganizerCard;

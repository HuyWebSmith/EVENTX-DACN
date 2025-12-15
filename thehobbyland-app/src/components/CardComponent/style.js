// src/components/CardComponent/style.js
import styled from "styled-components";
import { Card } from "antd";

export const WrapperCardStyle = styled(Card)`
  width: 300px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.15);
  }

  .ant-card-cover {
    position: relative;
  }

  .ant-card-body {
    padding: 12px !important;
  }
`;

export const WrapperImageStyle = styled.img`
  width: 68px;
  height: 14px;
  position: absolute;
  top: 8px;
  left: 0;
  z-index: 2;
  border-top-left-radius: 0;
  border-bottom-right-radius: 4px;
  background: rgba(0, 0, 0, 0.45);
  padding: 2px 6px;
`;

export const StyleNameProduct = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 22px;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const WrapperReportText = styled.div`
  font-size: 13px;
  color: #555;
  margin-bottom: 4px;

  span {
    color: #1890ff;
    font-weight: 500;
  }
`;

// Các style cũ bạn không dùng tới nữa thì mình bỏ bớt cho gọn (nếu cần thì thêm lại)
export const WrapperPriceText = styled.div`
  color: #ff4d4f;
  font-size: 18px;
  font-weight: 700;
`;

export const WrapperDiscountText = styled.span`
  color: #fff;
  background: #ff4d4f;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  margin-left: 8px;
`;

export const WrapperStyleTextSale = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  background: #ff4d4f;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  z-index: 2;
`;

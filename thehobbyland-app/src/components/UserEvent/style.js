// Thêm file: src/components/AdminEvent/style.js  (hoặc đặt cùng file nếu muốn)

import { Button } from "antd";
import styled from "styled-components";

export const WrapperHeader = styled.h1`
  color: #000;
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #e8e8e8;
`;

export const PageWrapper = styled.div`
  padding: 24px;
  background: #f9fafb;
  min-height: 100vh;
`;

export const AddButtonWrapper = styled.div`
  margin: 20px 0;
`;

export const StyledAddButton = styled(Button)`
  height: 150px !important;
  width: 150px !important;
  border-radius: 12px !important;
  border: 2px dashed #d9d9d9 !important;
  background: #fff !important;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    border-color: #1890ff !important;
    color: #1890ff !important;
    background: #f0f8ff !important;
  }

  span {
    font-size: 60px;
    color: #1890ff;
  }
`;

export const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 32px 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #1890ff;
  display: inline-block;
`;

export const UploadWrapper = styled.div`
  .ant-upload-picture-card-wrapper {
    display: inline-block;
  }
`;

export const RedInvoiceBox = styled.div`
  background: #fff9f0;
  border: 1px dashed #ffbb33;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
  h4 {
    margin: 0 0 16px 0;
    color: #d46b08;
    font-weight: 600;
  }
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
 16px;
  flex-wrap: wrap;
  margin-top: 10px;

  button {
    border-radius: 6px;
  }
`;

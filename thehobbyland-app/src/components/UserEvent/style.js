// Thêm file: src/components/AdminEvent/style.js  (hoặc đặt cùng file nếu muốn)

import { Button, DatePicker, Input, Select, Table, TimePicker } from "antd";
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
export const StyledFormItem = styled.div`
  margin-bottom: 24px;
`;

export const StyledInput = styled(Input)`
  border-radius: 8px;
  padding: 10px 14px;
  border: 1px solid #d9d9d9;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  &:focus {
    border-color: #4a90e2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
  }
`;

export const StyledTextArea = styled(Input.TextArea)`
  border-radius: 8px;
  padding: 10px;
  resize: none;
  border: 1px solid #d9d9d9;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  &:focus {
    border-color: #4a90e2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
  }
`;

export const StyledSelect = styled(Select)`
  width: 100%;
  border-radius: 8px !important;
  .ant-select-selector {
    border-radius: 8px !important;
    padding: 6px 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    transition: all 0.3s;
  }
  .ant-select-selector:focus {
    border-color: #4a90e2 !important;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2) !important;
  }
`;

export const StyledDatePicker = styled(DatePicker)`
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  &:focus {
    border-color: #4a90e2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
  }
`;

export const StyledTimePicker = styled(TimePicker)`
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  &:focus {
    border-color: #4a90e2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
  }
`;
export const NextButton = styled(Button)`
  background: linear-gradient(90deg, #4a90e2, #50e3c2);
  color: white;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  padding: 8px 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s;

  &:hover {
    background: linear-gradient(90deg, #50e3c2, #4a90e2);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.3);
  }
`;
export const BackButton = styled(Button)`
  background: white;
  color: #4a90e2;
  font-weight: 600;
  border: 2px solid #4a90e2;
  border-radius: 8px;
  padding: 8px 24px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;

  &:hover {
    background: linear-gradient(90deg, #e6f7ff, #d0f0ff);
    border-color: #50e3c2;
    color: #50e3c2;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;
export const StyledTable = styled(Table)`
  .ant-table-thead > tr > th {
    background-color: #f5f7fa;
    font-weight: 600;
    color: #333;
  }

  .ant-table-tbody > tr:hover {
    background-color: #f0f8ff;
  }

  .ant-table-cell {
    vertical-align: middle;
  }
`;

export const ActionButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #ddd;
  width: 40px;
  height: 40px;
  padding: 0;
  transition: all 0.3s;

  &:hover {
    background: linear-gradient(90deg, #4a90e2, #50e3c2);
    color: #fff !important;
    border-color: transparent;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

export const StyledLogo = styled(Image)`
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
`;

import { Row } from "antd";
import styled from "styled-components";
export const WrapperHeader = styled(Row)`
  padding: 10px 120px;
  background-color: #fff;
  gap: 16px;
  flex-wrap: nowrap;
  margin-left: 0 !important;
  margin-right: 0 !important;
  border-bottom: 1px solid #efefef;
`;

export const WrapperTextHeader = styled.span`
  font-size: 18px;
  color: #fff;
  font-weight: bold;
  text-align: left;
`;

export const WrapperHeaderAccount = styled.div`
  display: flex;
  align-items: center;
  color: #1d2636;
  gap: 10px;
  font-size: 12px;
`;

export const WrapperTextHeaderSmall = styled.span`
  font-size: 12px;
  color: #1d2636;
  text-align: center;
  white-space: nowrap;
`;
export const WrapperContentPopup = styled.p`
  cursor: pointer;
  &:hover {
    color: #83c6f0;
  }
`;

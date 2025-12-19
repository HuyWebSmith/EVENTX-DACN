import styled from "styled-components";
import { Button } from "antd";

export const WrapperHeader = styled.h1`
  color: #333;
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 20px;
`;

export const WrapperContentProfile = styled.div`
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  gap: 30px;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: flex-start;
  }
`;

export const WrapperAvatar = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-right: 1px solid #eee;

  @media (max-width: 767px) {
    border-right: none;
    border-bottom: 1px solid #eee;
  }
`;

export const AvatarPreview = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 4px solid #fff;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;
  margin-bottom: 15px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .anticon {
    font-size: 60px;
    color: #bfbfbf;
  }
`;

export const WrapperInputFields = styled.div`
  flex: 2;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

export const WrapperInput = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const WrapperLabel = styled.label`
  font-weight: 500;
  color: #555;
  font-size: 14px;
`;

export const UpdateButtonWrapper = styled.div`
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
`;

export const UploadButton = styled(Button)`
  border-radius: 6px;
  font-weight: 500;
`;

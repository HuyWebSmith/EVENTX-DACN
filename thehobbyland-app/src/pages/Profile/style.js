// src/pages/ProfilePage/style.js
import styled from "styled-components";

export const WrapperHeader = styled.h1`
  color: #333;
  font-size: 28px;
  font-weight: 700;
  text-align: center;
  margin: 40px 0 20px;
  padding-bottom: 12px;
  border-bottom: 3px solid #37b75a;
  display: inline-block;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

export const WrapperContentProfile = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 30px;
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  border: 1px solid #eee;

  @media (max-width: 768px) {
    padding: 30px 20px;
    border-radius: 12px;
  }
`;

export const WrapperLabel = styled.div`
  font-weight: 600;
  color: #444;
  margin-bottom: 8px;
  font-size: 15px;
`;

export const WrapperInput = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;

  &:last-of-type {
    margin-bottom: 32px;
  }
`;

// Avatar section riêng cho đẹp
export const WrapperAvatar = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const AvatarPreview = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid #f0f0f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .anticon {
    font-size: 50px;
    color: #ccc;
  }
`;

// Nút chọn ảnh
export const UploadButton = styled.div`
  padding: 10px 20px;
  background-color: #37b75a;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(55, 183, 90, 0.3);

  &:hover {
    background-color: #2da050;
    transform: translateY(-2px);
  }
`;

// Nút cập nhật ở dưới cùng
export const UpdateButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

import styled from "styled-components";
export const WrapperContainerLeft = styled.div`
  flex: 1;
  padding: 40px 45px 24px;
  display: flex;
  flex-direction: column;
  gap: 15px;

  /* CỰC KỲ TRONG SUỐT: Chỉ giữ 20% độ đen để làm nền cho chữ */
  background: rgba(0, 0, 0, 0.25);

  /* Hiệu ứng mờ ảo để chữ không bị rối khi đè lên ảnh */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  color: #fff;

  /* Viền trắng cực mảnh tạo hiệu ứng cạnh kính */
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-right: none;
  input::placeholder {
    color: rgba(255, 255, 255, 0.7); /* Màu trắng trong suốt 70% */
    font-style: italic; /* Có thể thêm nghiêng cho đẹp */
    opacity: 1; /* Đảm bảo màu hiện rõ trên các trình duyệt khác nhau */
  }
  h1 {
    color: #fff;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  }
  h3 {
    color: #eee;
  }
`;
export const WrapperContainerRight = styled.div`
  width: 300px;
  background: #fff;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
`;
export const WrapperTextLight = styled.span`
  color: rgb(13, 92, 182);
  font-size: 13px;
  cursor: pointer;
`;

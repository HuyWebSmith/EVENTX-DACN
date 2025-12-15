import styled from "styled-components";
import { Col, InputNumber } from "antd";

// 1. STYLE CHÍNH (TẠO HIỆU ỨNG TICKET BOX)
export const WrapperProductTicketStyle = styled.div`
  background: #242424; /* Màu nền tối */
  padding: 24px;
  border-radius: 12px; /* Bo góc nổi bật */

  color: #fff; /* Đặt màu chữ mặc định là trắng */
`;

export const WrapperStyleImageSmall = styled.img`
  height: 64px;
  width: 64px;
`;

export const WrapperStyleColImage = styled(Col)`
  flex-basis: unset;
  display: flex;
`;

// 2. TÊN SẢN PHẨM (MÀU TRẮNG)
export const WrapperStyleNameProduct = styled.h1`
  color: #fff; /* Đổi sang màu trắng */
  font-size: 20px;
  font-weight: 500;
  line-height: 150%;
  word-break: break-word;
  white-space: break-spaces;
`;

// 3. TEXT ĐÃ BÁN (MÀU XÁM NHẠT)
export const WrapperStyleTextSale = styled.span`
  font-size: 15px;
  line-height: 24px;
  color: #ccc; /* Màu xám nhạt */
`;

// 4. KHU VỰC GIÁ (MÀU NỀN TỐI HƠN)
export const WrapperPriceProduct = styled.div`
  background-color: #333333;
  border-radius: 4px;
  padding: 10px;
  margin: 10px 0;
`;

// 5. TEXT GIÁ (MÀU XANH LÁ NỔI BẬT)
export const WrapperPriceTextProduct = styled.h1`
  color: #00ff66; /* Màu xanh lá accent */
  font-size: 32px;
  line-height: 40px;
  margin-right: 8px;
  font-weight: 500;
  padding: 0;
  margin-top: 0;
`;

// 6. ĐỊA CHỈ (MÀU ACCENT)
export const WrapperAddressProduct = styled.div`
  span {
    color: #ccc;
  }
  span.address {
    text-decoration: underline;
    font-size: 15px;
    line-height: 24px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #00ff66; /* Màu xanh lá accent */
  }
  span.check-address {
    color: #00ff66; /* Màu xanh lá accent */
    font-size: 15px;
    line-height: 24px;
    font-weight: 500;
  }
`;

// 7. KHU VỰC SỐ LƯỢNG
export const WrapperQualityProduct = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
  width: 120px;
  border: 1px solid #666; /* Border xám đậm */
  border-radius: 4px;
`;

// 8. INPUT NUMBER
export const WrapperInputNumber = styled(InputNumber)`
  &.ant-input-number.ant-input-number-sm {
    width: 60px;
    border-left: none;
    border-right: none;
    background-color: transparent;

    .ant-input-number-input {
      color: #fff; /* Chữ số lượng màu trắng */
      text-align: center;
    }

    .ant-input-number-handler-wrap {
      display: none;
    }
  }
`;
const PerforationHole = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: ${(props) => props.$size || "20px"}; /* SỬ DỤNG PROP $size */
  height: ${(props) => props.$size || "20px"}; /* SỬ DỤNG PROP $size */
  border-radius: 50%;
  background: #1a1a1a;
  z-index: 10;
`;

// ==================== STYLED COMPONENTS MỚI - CHO PHẦN MÔ TẢ ====================

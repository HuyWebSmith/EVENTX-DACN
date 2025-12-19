import styled from "styled-components";

export const WrapperTypeProduct = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
  padding: 12px 0;
  margin-bottom: 20px;
  background: transparent;
  border-radius: 0;
  position: relative;
  z-index: 100;
`;

export const WrapperProducts = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 20px;
  flex-wrap: wrap;
  align-items: flex-start;

  & > div {
    flex: 1 1 calc(25% - 15px); // 4 card trên 1 hàng, trừ khoảng gap
    max-width: calc(25% - 15px);
    box-sizing: border-box;
  }
`;

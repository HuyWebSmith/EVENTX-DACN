import styled from "styled-components";

export const CategoryItem = styled.div`
  padding: 10px 16px;
  background: #f7f7f7;
  border-radius: 20px;
  border: 1px solid #ddd;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
  font-weight: 500;

  &:hover {
    background: #37b75a;
    border-color: #37b75a;
    color: white;
    transform: translateY(-1px);
  }
`;

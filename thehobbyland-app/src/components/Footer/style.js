import styled from "styled-components";

export const WrapperContainer = styled.footer`
  background-color: #1a1a1a; /* Màu nền tối sang trọng */
  width: 100%;
  margin-top: 50px;
`;

export const FooterTitle = styled.h4`
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 25px;
  position: relative;

  &:after {
    content: "";
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 40px;
    height: 2px;
    background-color: #3d8e9d; /* Màu xanh đồng bộ với header/slider */
  }
`;

export const FooterLink = styled.a`
  color: #fff;
  opacity: 0.7;
  display: block;
  margin-bottom: 12px;
  transition: all 0.3s ease;
  text-decoration: none;

  &:hover {
    opacity: 1;
    color: #3d8e9d;
    padding-left: 5px;
  }
`;

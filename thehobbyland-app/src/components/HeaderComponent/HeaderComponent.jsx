import React, { useState } from "react";
import { Col, Badge, Popover, Button, Flex } from "antd";
import { WrapperContentPopup, WrapperHeader } from "./style";
import { WrapperTextHeader } from "./style";
import { WrapperHeaderAccount } from "./style";
import { WrapperTextHeaderSmall } from "./style";
import ButtonInputSearch from "../ButtonInputSearch/ButtonInputSearch";
import LogoImage from "../../assets/images/Gemini_Generated_Image_x9wo02x9wo02x9wo_preview_rev_1.png";
import {
  UserOutlined,
  CaretDownOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../services/UserService";
import { resetUser } from "../../redux/slides/userSlide";
import LoadingComponent from "../LoadingComponent/LoadingComponent";

const HeaderComponent = ({ isHiddenSearch = false, isHiddenCart = false }) => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const order = useSelector((state) => state.order);
  const totalCartItems = order?.totalItems ?? 0;
  const handleNavigateLogin = () => {
    navigate("/sign-in");
  };
  const handleGoWallet = () => navigate("/wallet");
  const handleGoWithdraw = () => navigate("/wallet/withdraw");
  const handleGoHistory = () => navigate("/wallet/history");

  const handleGoHome = () => navigate("/");
  const handleLogout = async () => {
    setLoading(true);
    await logoutUser();
    dispatch(resetUser());
    setLoading(false);
  };

  const content = (
    <div>
      {user?.isAdmin && (
        <WrapperContentPopup onClick={() => navigate("/system/admin")}>
          Quản lý hệ thống
        </WrapperContentPopup>
      )}
      <WrapperContentPopup onClick={() => navigate("/system/user")}>
        Quản lý sự kiện
      </WrapperContentPopup>
      <WrapperContentPopup onClick={() => navigate("/profile-user")}>
        Thông tin người dùng
      </WrapperContentPopup>
      <WrapperContentPopup onClick={handleLogout}>
        Đăng xuất
      </WrapperContentPopup>
    </div>
  );
  const walletMenu = (
    <div>
      <WrapperContentPopup onClick={handleGoWallet}>
        Nạp tiền
      </WrapperContentPopup>

      <WrapperContentPopup onClick={handleGoWithdraw}>
        Rút tiền
      </WrapperContentPopup>

      <WrapperContentPopup onClick={handleGoHistory}>
        Lịch sử giao dịch
      </WrapperContentPopup>
    </div>
  );

  return (
    <div>
      <WrapperHeader
        gutter={16}
        style={{
          justifyContent:
            isHiddenSearch && isHiddenSearch ? "space-between" : "unset",
        }}
      >
        <Col span={5}>
          <WrapperTextHeader></WrapperTextHeader>
          <img
            src={LogoImage}
            alt="Logo EventX"
            style={{
              width: "140px",
              height: "50px",
              objectFit: "cover",
              background: "#2DC275",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            onClick={handleGoHome}
          />
        </Col>
        {!isHiddenSearch && (
          <Col span={13}>
            <ButtonInputSearch
              bordered={false}
              size="large"
              textButton="Tìm kiếm"
              placeholder="Tìm kiếm sự kiện,concert, địa điểm bạn muốn..."
              // onSearch={onSearch}
            />
          </Col>
        )}
        <Col
          span={6}
          style={{ display: "flex", gap: "54px", alignItems: "center" }}
        >
          {user?.access_token && (
            <Popover content={walletMenu} trigger="click">
              <div
                style={{
                  cursor: "pointer",
                  padding: "8px 16px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontWeight: 600,
                  background: "#ffffff",
                  border: "1px solid #e6ebf5",
                  boxShadow: "0px 2px 6px rgba(0,0,0,0.06)",
                  color: "#1f4dd8",
                  fontSize: "14px",
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap", // <= CHẶN XUỐNG DÒNG
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f3f7ff";
                  e.currentTarget.style.boxShadow =
                    "0px 3px 10px rgba(0,0,0,0.10)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#ffffff";
                  e.currentTarget.style.boxShadow =
                    "0px 2px 6px rgba(0,0,0,0.06)";
                }}
              >
                <span>{user.walletBalance?.toLocaleString() || 0} đ</span>
                <CaretDownOutlined style={{ fontSize: 12, opacity: 0.7 }} />
              </div>
            </Popover>
          )}

          <LoadingComponent isLoading={loading}>
            <WrapperHeaderAccount
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                maxWidth: "230px",
                overflow: "hidden",
              }}
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="Avatar"
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <UserOutlined style={{ fontSize: "30px" }} />
              )}

              {user?.access_token ? (
                <Popover content={content} trigger="click">
                  <div
                    style={{
                      cursor: "pointer",
                      maxWidth: "160px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {user?.fullName?.length ? user.fullName : user.email}
                  </div>
                </Popover>
              ) : (
                <div
                  onClick={handleNavigateLogin}
                  style={{ cursor: "pointer" }}
                >
                  <WrapperTextHeaderSmall>
                    Đăng nhập/Đăng ký
                  </WrapperTextHeaderSmall>
                  <div>
                    <WrapperTextHeaderSmall>Tài khoản</WrapperTextHeaderSmall>
                    <CaretDownOutlined />
                  </div>
                </div>
              )}
            </WrapperHeaderAccount>
          </LoadingComponent>
        </Col>
      </WrapperHeader>
    </div>
  );
};

export default HeaderComponent;

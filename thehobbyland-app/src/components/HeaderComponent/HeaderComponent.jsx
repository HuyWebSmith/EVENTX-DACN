import React, { useState } from "react";
import { Col, Badge, Popover, Button, Flex } from "antd";
import { WrapperContentPopup, WrapperHeader } from "./style";
import { WrapperTextHeader } from "./style";
import { WrapperHeaderAccount } from "./style";
import { WrapperTextHeaderSmall } from "./style";
import ButtonInputSearch from "../ButtonInputSearch/ButtonInputSearch";
import LogoImage from "../../assets/images/logo_EventX.jpg";
import {
  UserOutlined,
  CaretDownOutlined,
  ShoppingCartOutlined,
  SettingOutlined,
  AccountBookOutlined,
  LogoutOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../services/UserService";
import { resetUser } from "../../redux/slides/userSlide";
import LoadingComponent from "../LoadingComponent/LoadingComponent";
import {
  FacebookFilled,
  InstagramFilled,
  TwitterSquareFilled,
  SearchOutlined,
} from "@ant-design/icons";
import { useRef } from "react";

const HeaderComponent = ({ isHiddenSearch = false, isHiddenCart = false }) => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const socialIconStyle = {
    width: 36,
    height: 36,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#1D2636", // màu nền vòng tròn
    color: "#fff", // icon trắng
    cursor: "pointer",
    transition: "0.25s",
  };

  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);

  const order = useSelector((state) => state.order);
  const totalCartItems = order?.totalItems ?? 0;
  const handleNavigateLogin = () => {
    navigate("/sign-in");
  };
  const timeoutRef = useRef(null);
  const handleSearch = (value) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      if (!value?.trim()) return;

      console.log("Thực hiện tìm kiếm với:", value);
      setOpenSearch(false);
      navigate(`/search?keyword=${encodeURIComponent(value)}`);
    }, 500);
  };

  const handleGoWallet = () => navigate("/wallet");
  const handleGoWithdraw = () => navigate("/wallet/withdraw");
  const handleGoHistory = () => navigate("/wallet/history");
  const searchContent = (
    <div style={{ width: 320 }}>
      <ButtonInputSearch
        bordered
        size="middle"
        textButton="Tìm"
        placeholder="Tìm sự kiện, concert, địa điểm..."
        onSearch={handleSearch}
      />
    </div>
  );

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
          <SettingOutlined style={{ marginRight: 8 }} />
          Quản lý hệ thống
        </WrapperContentPopup>
      )}
      <WrapperContentPopup onClick={() => navigate("/system/user?tab=event")}>
        <CalendarOutlined style={{ marginRight: 8 }} />
        Sự kiện của tôi
      </WrapperContentPopup>

      <WrapperContentPopup onClick={() => navigate("/system/user?tab=ticket")}>
        <AccountBookOutlined style={{ marginRight: 8 }} />
        Vé của tôi
      </WrapperContentPopup>

      <WrapperContentPopup onClick={() => navigate("/profile-user")}>
        <UserOutlined style={{ marginRight: 8 }} />
        Thông tin người dùng
      </WrapperContentPopup>

      <WrapperContentPopup onClick={handleLogout}>
        <LogoutOutlined style={{ marginRight: 8 }} />
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
        // style={{
        //   justifyContent:
        //     isHiddenSearch && isHiddenSearch ? "space-between" : "unset",
        // }}
        align="middle"
      >
        <Col span={8}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div
              style={socialIconStyle}
              onClick={() => window.open("https://facebook.com", "_blank")}
            >
              <FacebookFilled />
            </div>

            <div
              style={socialIconStyle}
              onClick={() => window.open("https://instagram.com", "_blank")}
            >
              <InstagramFilled />
            </div>

            <div
              style={socialIconStyle}
              onClick={() => window.open("https://twitter.com", "_blank")}
            >
              <TwitterSquareFilled />
            </div>
          </div>
        </Col>

        <Col
          span={8}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <img
            src={LogoImage}
            alt="Logo EventX"
            style={{
              width: "220px",
              height: "auto",
              maxHeight: "80px",
              objectFit: "contain",
              cursor: "pointer",
              background: "transparent",
              border: "none",
            }}
            onClick={handleGoHome}
          />

          <span
            style={{
              fontSize: "12px",
              fontWeight: "700",
              color: "#555",
              letterSpacing: "2px",
              textTransform: "uppercase",
            }}
          >
            EVENTX ECOSYSTEM
          </span>
        </Col>

        <Col span={8}>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 20,
              alignItems: "center",
              fontWeight: 600,
            }}
          >
            {/* 🔍 SEARCH ICON */}
            <Popover content={searchContent} trigger="click" placement="bottom">
              <p style={{ cursor: "pointer", color: "black", margin: 0 }}>
                Search
              </p>
            </Popover>

            {/*  WALLET */}
            {user?.access_token && (
              <Popover
                content={walletMenu}
                trigger="click"
                placement="bottomRight"
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 16px",
                    borderRadius: "20px",
                    background:
                      "linear-gradient(135deg, #ffffff 0%, #f8faff 100%)",
                    border: "1px solid #dbeafe",
                    boxShadow: "0 2px 4px rgba(31, 77, 216, 0.05)",
                    cursor: "pointer",
                    transition: "all 0.3s ease",

                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#1D2636";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(31, 77, 216, 0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e6ebf5";
                    e.currentTarget.style.boxShadow =
                      "0 2px 4px rgba(31, 77, 216, 0.05)";
                  }}
                >
                  <span
                    style={{
                      fontSize: "16px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  ></span>

                  <span
                    style={{
                      fontWeight: 700,
                      color: "#1D2636",
                      fontSize: "14px",
                    }}
                  >
                    {user.walletBalance?.toLocaleString() || 0}{" "}
                    <span style={{ fontSize: "12px" }}>đ</span>
                  </span>
                </div>
              </Popover>
            )}

            {/* 👤 ACCOUNT */}
            {/* <LoadingComponent isLoading={loading}> */}
            <WrapperHeaderAccount
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                maxWidth: "230px",
                overflow: "hidden",
              }}
            >
              {/* Avatar có loading */}
              <LoadingComponent isLoading={loading}>
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="Avatar"
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <UserOutlined style={{ fontSize: 30 }} />
                )}
              </LoadingComponent>

              {/* Text + Popover KHÔNG bọc loading */}
              {user?.access_token ? (
                <Popover
                  content={content}
                  trigger="click"
                  placement="bottomRight"
                >
                  <div
                    style={{
                      cursor: "pointer",
                      maxWidth: 160,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {user?.fullName || user.email}
                    <CaretDownOutlined style={{ marginLeft: 6 }} />
                  </div>
                </Popover>
              ) : (
                <div
                  onClick={handleNavigateLogin}
                  style={{ cursor: "pointer" }}
                >
                  <WrapperTextHeaderSmall>
                    Đăng nhập / Đăng ký
                  </WrapperTextHeaderSmall>
                </div>
              )}
            </WrapperHeaderAccount>
            {/* </LoadingComponent> */}
          </div>
        </Col>
      </WrapperHeader>
    </div>
  );
};

export default HeaderComponent;

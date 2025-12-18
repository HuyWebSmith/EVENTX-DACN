import React, { useState, useEffect } from "react";
import { Row, Col, Image, Modal } from "antd";
import styled from "styled-components";
import {
  PlusOutlined,
  HeartOutlined,
  HeartFilled,
  EnvironmentOutlined,
} from "@ant-design/icons";
import ButtonComponent from "../ButtonComponent/ButtonComponent";
import dayjs from "dayjs";
import { updateFavorites, userSlice } from "../../redux/slides/userSlide";
import { useSelector, useDispatch } from "react-redux";

import axios from "axios";
// ==================== STYLED COMPONENTS ====================
const TicketWrapper = styled.div`
  background: #1a1a1a;
  border-radius: 16px;
  overflow: hidden;
  max-width: 1240px;
  margin: 30px auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
  border: 1px solid #333;
`;
const LeftPanel = styled.div`
  background: linear-gradient(135deg, #1e1e1e 0%, #262626 100%);
  padding: 32px 28px;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-right: 1px dashed #444;
`;

const EventName = styled.h1`
  font-size: 28px;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 24px 0;
  line-height: 1.2;
  letter-spacing: -0.5px;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  color: #e0e0e0;
  font-size: 15px;
  margin-bottom: 16px;
  font-weight: 500;
`;

const DateLocationText = styled.span`
  color: #cccccc;
`;

const PriceSection = styled.div`
  margin: 32px 0;
  padding-top: 24px;
  border-top: 1px solid #444;
  display: flex;
  align-items: baseline;
  gap: 8px;
`;

const PriceLabel = styled.span`
  color: #aaaaaa;
  font-size: 15px;
`;

const PriceValue = styled.span`
  color: #00ff80;
  font-size: 28px;
  font-weight: 800;
`;

const RightPanel = styled.div`
  position: relative;
  height: 580px;
  overflow: hidden;
`;

const BannerImage = styled(Image)`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const BannerOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, transparent 100%);
  padding: 80px 40px 30px;
  color: white;
`;

const BannerEventName = styled.h2`
  font-size: 42px;
  font-weight: 900;
  margin: 0;
  color: #e0c3fc;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.8);
  line-height: 1.1;
  letter-spacing: -1px;
`;

// Icon SVG
const CalendarIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 16 16"
    fill="#00ff80"
    style={{ marginRight: "10px", flexShrink: 0 }}
  >
    <path d="M4 .5a.5.5 0 0 0-1 0V1H2a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-1V.5a.5.5 0 0 0-1 0V1H4V.5zM15 14a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V5h14v9z"></path>
  </svg>
);

const LocationIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 16 16"
    fill="#00cc66"
    style={{ marginRight: "10px", flexShrink: 0 }}
  >
    <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"></path>
  </svg>
);

// ==================== STYLED COMPONENTS MỚI - CHO PHẦN MÔ TẢ ====================
const DescriptionSection = styled.div`
  max-width: 1240px;
  margin: 40px auto;
  padding: 30px;
  background: #1a1a1a;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  border: 1px solid #333;
`;

const SectionTitle = styled.h3`
  color: #00ff80;
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 20px;
  border-bottom: 2px solid #2e2e2e;
  padding-bottom: 10px;
`;

const DescriptionText = styled.p`
  color: #cccccc;
  font-size: 16px;
  line-height: 1.8;
  margin-bottom: 10px;
  white-space: pre-wrap;

  // === THÊM PHẦN NÀY ĐỂ XỬ LÝ ẢNH TRÀN ===
  img {
    max-width: 100%; /* Đảm bảo chiều rộng không bao giờ vượt quá thẻ cha */
    height: auto; /* Giữ tỷ lệ khung hình */
    display: block; /* Giúp căn chỉnh và xử lý khoảng trắng tốt hơn */
    margin: 20px 0; /* Khoảng cách trên dưới cho ảnh */
    border-radius: 8px; /* Bo góc cho ảnh (tùy chọn) */
  }
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: #00ff80;
  font-weight: 600;
  cursor: pointer;
  padding: 5px 0;
  font-size: 15px;
  transition: color 0.2s ease-in-out;

  &:hover {
    color: #00cc66;
  }
`;

// ==================== COMPONENT CHÍNH (ĐÃ SỬA LỖI CÚ PHÁP) ====================
const ProductDetailComponent = ({ productDetails, onSelectTicketClick }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [mapLocation, setMapLocation] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);
  const description = productDetails.bannerOverlayText || "";
  const MAX_LENGTH = 300;

  const needsTruncation = description.length > MAX_LENGTH;
  const currentUser = useSelector((state) => state.user);
  const displayedText =
    needsTruncation && !showFullDescription
      ? description.substring(0, MAX_LENGTH) + "..."
      : description;
  useEffect(() => {
    if (currentUser?.favorites && productDetails?._id) {
      setIsFavorite(currentUser.favorites.includes(productDetails._id));
    }
  }, [currentUser, productDetails]);
  const dispatch = useDispatch();
  const toggleFavorite = async () => {
    if (!currentUser?.id)
      return alert("Vui lòng đăng nhập để yêu thích sự kiện");

    setLoadingFavorite(true);
    try {
      const eventId = productDetails._id;
      let updatedFavorites = [...(currentUser.favorites || [])]; // đảm bảo luôn là array

      if (isFavorite) {
        // Xóa khỏi yêu thích
        await axios.post("http://localhost:3000/api/favorite/removeFavorite", {
          userId: currentUser.id,
          eventId: eventId,
        });
        updatedFavorites = updatedFavorites.filter((id) => id !== eventId);
      } else {
        // Thêm vào yêu thích
        await axios.post("http://localhost:3000/api/favorite/addFavorite", {
          userId: currentUser.id,
          eventId: eventId,
        });
        updatedFavorites.push(eventId);
      }

      // Cập nhật lại Redux
      dispatch(updateFavorites(updatedFavorites));
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingFavorite(false);
    }
  };

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };
  const openMapModal = (location, fullAddress) => {
    setMapLocation(`${location}, ${fullAddress}`);
    setMapModalVisible(true);
  };

  const closeMapModal = () => {
    setMapModalVisible(false);
    setMapLocation("");
  };
  const calculateOtherDays = () => {
    // Giả sử productDetails chứa eventDate và eventEndDate
    const startDate = productDetails.eventDate;
    const endDate = productDetails.eventEndDate;

    if (startDate && endDate) {
      const startDay = dayjs(startDate).startOf("day");
      const endDay = dayjs(endDate).startOf("day");

      const diffInDays = endDay.diff(startDay, "day");

      return diffInDays > 0 ? diffInDays : 0;
    }
    return 0;
  };
  const numberOfOtherDays = calculateOtherDays();
  const showOtherDaysButton = numberOfOtherDays > 0;
  const data = {
    name: "Tên sự kiện mặc định",
    dateTime: "20:00, Thứ Bảy - 20/12/2025",
    location: "Cung Văn hóa Hữu nghị Việt Xô",
    address: "91 Trần Hưng Đạo",
    fullAddress: "Hoàn Kiếm, Hà Nội",
    price: "690.000 ₫",
    bannerImageUrl:
      "https://via.placeholder.com/1200x800/2d1b3a/00ff80?text=EVENT+BANNER",
    ...productDetails,
  };
  const eventDateObj = dayjs(productDetails?.eventDate);
  const eventEndDateObj = dayjs(productDetails?.eventEndDate);

  // Trạng thái của sự kiện
  const isExpired = eventEndDateObj.isBefore(dayjs()); // Đã qua hạn
  const isStarted = eventDateObj.isBefore(dayjs());
  return (
    <>
      {/* === 1. PHẦN THÔNG TIN TỔNG QUAN VÀ BANNER (TicketWrapper) === */}
      <TicketWrapper>
        <Row align="middle" gutter={16} style={{ margin: 0, height: "580px" }}>
          {/* === PHẦN TRÁI: THÔNG TIN CHI TIẾT === */}
          <Col xs={24} md={8}>
            <LeftPanel>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "16px",
                }}
              >
                <EventName>{data.name}</EventName>
                <button
                  onClick={toggleFavorite}
                  disabled={loadingFavorite}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "24px",
                  }}
                >
                  {isFavorite ? (
                    <HeartFilled style={{ color: "red" }} />
                  ) : (
                    <HeartOutlined style={{ color: "#00ff80" }} />
                  )}
                </button>
              </div>

              <InfoRow>
                <CalendarIcon />
                <DateLocationText>{data.dateTime}</DateLocationText>
              </InfoRow>

              {showOtherDaysButton && (
                <ButtonComponent
                  styleButton={{
                    background: "#333",
                    border: "1px solid #555",
                    height: "40px",
                    width: "160px",
                    borderRadius: "8px",
                    marginBottom: "24px",
                  }}
                  // Chèn giá trị tính toán vào template literal
                  textButton={`+ ${numberOfOtherDays} ngày khác`}
                  styleTextButton={{ color: "#fff", fontSize: "14px" }}
                />
              )}

              <div style={{ flex: 1 }}>
                <InfoRow>
                  <LocationIcon />
                  <div style={{ lineHeight: "1.4" }}>
                    {/* Tên địa điểm chính – đậm, nổi bật */}
                    <div
                      style={{
                        color: "#ffffff",
                        fontWeight: "700",
                        fontSize: "16.5px",
                        marginBottom: "4px",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        openMapModal(data.location, data.fullAddress)
                      }
                    >
                      {data.location}
                    </div>

                    {/* Địa chỉ chi tiết – nhỏ hơn, màu xám nhẹ nhàng */}
                    <div
                      style={{
                        color: "#aaaaaa",
                        fontSize: "14px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                      onClick={() =>
                        openMapModal(data.location, data.fullAddress)
                      }
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                      ></svg>
                      {data.address} • {data.fullAddress}
                    </div>
                  </div>
                </InfoRow>
              </div>

              <PriceSection>
                <PriceLabel>Giá từ</PriceLabel>
                <PriceValue>{data.price}</PriceValue>
                <PlusOutlined
                  style={{
                    color: "#00ff80",
                    marginLeft: "auto",
                    fontSize: "18px",
                  }}
                />
              </PriceSection>

              {/* NÚT CHỌN VÉ NGAY - ĐÃ GÁN onClick */}
              <ButtonComponent
                onClick={
                  !isExpired && !isStarted ? onSelectTicketClick : undefined
                }
                disabled={isExpired || isStarted}
                styleButton={{
                  background: "linear-gradient(90deg, #00cc66, #00ff80)",
                  height: "56px",
                  width: "100%",
                  borderRadius: "12px",
                  border: "none",
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#000",
                  boxShadow: "0 8px 25px rgba(0, 204, 102, 0.3)",

                  // ⭐ Thêm 2 dòng này ↓
                  opacity: isExpired || isStarted ? 0.5 : 1,
                  cursor: isExpired || isStarted ? "not-allowed" : "pointer",
                }}
                textButton="CHỌN VÉ NGAY"
              />
            </LeftPanel>
          </Col>

          {/* === PHẦN PHẢI: ẢNH BANNER SIÊU NGẦU === */}
          <Col xs={24} md={16}>
            <RightPanel>
              <BannerImage
                src={data.bannerImageUrl}
                alt="Event Banner"
                preview={false}
                fallback="https://via.placeholder.com/1200x800/1a1a2e/00ff80?text=NO+IMAGE"
              />
              <BannerOverlay>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <BannerEventName>{data.name}</BannerEventName>
                  <button
                    onClick={toggleFavorite}
                    disabled={loadingFavorite}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "28px",
                    }}
                  ></button>
                </div>
              </BannerOverlay>
            </RightPanel>
          </Col>
        </Row>
      </TicketWrapper>

      {description && (
        <DescriptionSection>
          <SectionTitle>Giới Thiệu Sự Kiện</SectionTitle>

          <DescriptionText
            dangerouslySetInnerHTML={{ __html: displayedText }}
          />

          {needsTruncation && (
            <ToggleButton onClick={toggleDescription}>
              {showFullDescription ? "Thu gọn ▲" : "Xem thêm ▼"}
            </ToggleButton>
          )}
        </DescriptionSection>
      )}

      <Modal
        open={mapModalVisible} // Ant Design 5.x dùng 'open' thay cho 'visible'
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <EnvironmentOutlined style={{ color: "#1890ff" }} />
            <span>Vị trí sự kiện</span>
          </div>
        }
        onCancel={closeMapModal}
        footer={null}
        width={800}
        centered
        bodyStyle={{ padding: "0" }} // Xóa padding mặc định để bản đồ tràn viền đẹp hơn
        className="luxury-map-modal"
      >
        {mapLocation ? (
          <div
            style={{
              width: "100%",
              height: "500px",
              overflow: "hidden",
              borderRadius: "0 0 12px 12px",
            }}
          >
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${encodeURIComponent(
                mapLocation
              )}&output=embed`}
            />
          </div>
        ) : (
          <div style={{ padding: "40px", textAlign: "center", color: "#888" }}>
            <p>Đang tải dữ liệu vị trí...</p>
          </div>
        )}
      </Modal>
    </>
  );
};

export default ProductDetailComponent;

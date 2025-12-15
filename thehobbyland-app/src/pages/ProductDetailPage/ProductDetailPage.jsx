import React, { useEffect, useState, useRef } from "react";
import ProductsDetailComponent from "../../components/ProductDetailComponent/ProductDetailComponent";
import { getDetailsEvent } from "../../services/ProductService";
import { useParams } from "react-router-dom";
import OrganizerCard from "../../components/OrganizerCard/OrganizerCard";
import EventScheduleComponent from "../../components/EventScheduleComponent/EventScheduleComponent";
import dayjs from "dayjs";
import EventComment from "../../components/EventComment/EventComment";

// Hàm định dạng ngày giờ (giữ nguyên)
const formatDateTime = (date, time) => {
  if (!date || !time) return "Chưa rõ ngày giờ";

  const datePart = new Date(date).toLocaleDateString("vi-VN");
  const timePart = new Date(time).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${timePart} - ${datePart}`;
};

// --- Component Voucher/Banner Quảng cáo ---
const DiscountVoucherCard = () => {
  const voucherImageUrl =
    "https://ticketbox.vn/_next/image?url=https%3A%2F%2Fsalt.tkbcdn.com%2Fts%2Fds%2Fab%2Fdf%2F5c%2F6da51dd7722a871f5cf65ca2f0e3e08e.jpg&w=1920&q=75";

  return (
    <div
      style={{
        width: "100%",
        background: "#e6fffb",
        padding: "10px",
        borderRadius: "8px",
      }}
    >
      <img
        src={voucherImageUrl}
        alt="Voucher giảm giá 40,000 Đồng"
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          objectFit: "cover",
          borderRadius: "6px",
        }}
      />
    </div>
  );
};

export const ProductDetailPage = () => {
  const { id } = useParams();

  const [productDetails, setProductDetails] = useState(null);
  const [rawEventData, setRawEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const eventScheduleRef = useRef(null);

  const scrollToSchedule = () => {
    if (eventScheduleRef.current) {
      eventScheduleRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };
  // =========================
  // Modal Bản đồ
  // =========================
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [mapLocation, setMapLocation] = useState("");

  const openMapModal = (location) => {
    setMapLocation(location);
    setMapModalVisible(true);
  };

  const closeMapModal = () => {
    setMapModalVisible(false);
    setMapLocation("");
  };
  // Format dữ liệu từ backend
  const formatEventData = (backendData) => {
    if (!backendData) return null;

    const locationData = backendData.locations && backendData.locations[0];

    let fullAddress = "Chi tiết địa chỉ chưa rõ";
    if (locationData) {
      const parts = [
        locationData.ward,
        locationData.district,
        locationData.city,
      ];
      fullAddress = parts.filter((p) => p).join(", ");
    }

    const ticketData =
      backendData.tickets && backendData.tickets.length > 0
        ? backendData.tickets.sort((a, b) => a.price - b.price)[0]
        : null;

    const eventImages = backendData.eventImages || [];
    const mainImage =
      eventImages.find((img) => img.isPrimary === true) || eventImages[0];

    const bannerUrl = mainImage
      ? mainImage.imageUrl
      : backendData.image || backendData.organizerBannerUrl;

    return {
      _id: backendData._id,
      name: backendData.title || "Sự kiện chưa có tên",
      dateTime: formatDateTime(
        backendData.eventDate,
        backendData.eventStartTime
      ),
      location: locationData ? locationData.name : "Địa điểm chưa rõ",
      fullAddress: fullAddress,
      address: locationData?.address,
      price: ticketData
        ? `${ticketData.price.toLocaleString("vi-VN")} ₫`
        : "Liên hệ",
      bannerImageUrl: bannerUrl || "placeholder-url",
      bannerOverlayText: backendData.description || "Mô tả ngắn...",
      organizerName: backendData.organizerName,
      organizerEmail: backendData.organizerEmail,
      organizerInfo: backendData.organizerInfo,
      organizerLogoUrl: backendData.organizerLogoUrl,
    };
  };

  useEffect(() => {
    const loadProductData = async () => {
      if (!id) {
        setLoading(false);
        return setError("Không tìm thấy ID sự kiện.");
      }

      try {
        setLoading(true);
        const response = await getDetailsEvent(id);
        const rawData = response.data || response;

        setRawEventData(rawData);
        setProductDetails(formatEventData(rawData));
      } catch (err) {
        setError(err.message || "Không thể tải dữ liệu chi tiết.");
      } finally {
        setLoading(false);
      }
    };

    loadProductData();
  }, [id]);

  // Loading
  if (loading) {
    return (
      <div
        style={{
          padding: "100px 120px",
          textAlign: "center",
          background: "#efefef",
        }}
      >
        Đang tải thông tin sự kiện...
      </div>
    );
  }

  // Error
  if (error || !productDetails) {
    return (
      <div
        style={{
          padding: "100px 120px",
          textAlign: "center",
          color: "red",
          background: "#efefef",
        }}
      >
        Lỗi: {error || "Không tìm thấy dữ liệu chi tiết."}
      </div>
    );
  }

  // ==== TÍNH GIỜ CHUẨN NGAY TRƯỚC KHI RENDER ====

  const now = dayjs();

  const eventStart = dayjs(
    `${rawEventData.eventDate} ${rawEventData.eventStartTime}`
  );
  const eventEnd = dayjs(
    `${rawEventData.eventDate} ${rawEventData.eventEndTime}`
  );

  const isExpired = now.isAfter(eventEnd);
  const isStarted = now.isAfter(eventStart) && now.isBefore(eventEnd);

  // =====================================================

  return (
    <div
      style={{ padding: "0 120px", background: "#efefef", minHeight: "100vh" }}
    >
      <h3 style={{ padding: "20px 0", color: "#666" }}>
        Trang chủ / Chi tiết sự kiện
      </h3>

      {/* Banner + Nút chọn vé */}
      <ProductsDetailComponent
        productDetails={productDetails}
        onSelectTicketClick={scrollToSchedule}
        isExpired={isExpired}
        isStarted={isStarted}
      />

      {/* Body: Thông tin, vé, voucher */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          alignItems: "flex-start",
          marginTop: "20px",
        }}
      >
        {/* Left 70% */}
        <div style={{ flex: "70%", minWidth: 0 }}>
          {rawEventData && rawEventData.tickets && (
            <div style={{ marginBottom: "20px" }} ref={eventScheduleRef}>
              <EventScheduleComponent
                tickets={rawEventData.tickets}
                eventId={id}
              />
            </div>
          )}

          {/* Organizer card */}
          {productDetails && productDetails.organizerName && (
            <div style={{ marginBottom: 40 }}>
              <OrganizerCard organizer={productDetails} />
            </div>
          )}
          <div style={{ marginBottom: 40 }}>
            <EventComment eventId={id} />
          </div>
        </div>

        {/* Right 30% */}
        <div style={{ flex: "30%", minWidth: "320px", maxWidth: "350px" }}>
          <DiscountVoucherCard />
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;

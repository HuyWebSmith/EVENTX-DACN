import React, { useState, useEffect, useRef } from "react";
import { Menu, Table, Tag, message, Modal, Button, Steps } from "antd";
import {
  CalendarOutlined,
  AccountBookOutlined,
  HeartOutlined,
  SettingOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

import HeaderComponent from "../../components/HeaderComponent/HeaderComponent";
import UserEvent from "../../components/UserEvent/UserEvent";
import { axiosJWT } from "../../services/UserService";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

import "./UserPage.css";
import * as faceapi from "face-api.js";
import { useSelector } from "react-redux";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Tabs } from "antd";
import { Typography } from "antd";
import { useLocation } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
const { Text } = Typography;
const menuItems = [
  { key: "event", icon: <CalendarOutlined />, label: "Sự kiện của tôi" },
  { key: "ticket", icon: <AccountBookOutlined />, label: "Vé đã mua" },
  { key: "favorite", icon: <HeartOutlined />, label: "Yêu thích" },
];
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const UserPage = () => {
  const [selectedKey, setSelectedKey] = useState("event");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favoriteEvents, setFavoriteEvents] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const currentUser = useSelector((state) => state.user);
  // ==== Face Modal ====
  const [faceModalVisible, setFaceModalVisible] = useState(false);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [faceAction, setFaceAction] = useState("register"); // "register" | "checkin"
  const videoRef = useRef();
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [mapLocation, setMapLocation] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [modal, contextHolder] = Modal.useModal();
  const [faceMessage, setFaceMessage] = useState(null);
  const [faceMessageType, setFaceMessageType] = useState("success");
  const [currentStep, setCurrentStep] = useState(0);
  const [scannedTicketCode, setScannedTicketCode] = useState("");
  const [isVerifyingQR, setIsVerifyingQR] = useState(false);
  const location1 = useLocation();
  const queryParams = new URLSearchParams(location1.search);
  const tabFromQuery = queryParams.get("tab");
  useEffect(() => {
    if (tabFromQuery) {
      setSelectedKey(tabFromQuery);
    }
  }, [tabFromQuery]);
  const startQRScanner = () => {
    const scanner = new Html5QrcodeScanner("qr-reader-register", {
      fps: 10,
      qrbox: { width: 200, height: 200 },
    });

    scanner.render(
      async (decodedText) => {
        setIsVerifyingQR(true);
        // Kiểm tra mã vé xem có khớp với vé của user không (tùy chọn)
        setScannedTicketCode(decodedText);
        message.success("Đã nhận diện mã vé!");
        scanner.clear(); // Dừng quét sau khi thành công
        setIsVerifyingQR(false);
      },
      (err) => {
        // Error callback
      }
    );
  };

  // Gọi startQRScanner khi currentStep === 0 và Modal mở
  useEffect(() => {
    let scanner;
    if (faceModalVisible && currentStep === 0) {
      setTimeout(() => {
        scanner = new Html5QrcodeScanner("qr-reader-register", {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        });
        scanner.render((decodedText) => {
          setScannedTicketCode(decodedText);
          message.success("Đã nhận diện vé!");
          // Dừng scanner ngay khi quét được để nhường camera cho bước sau
          scanner.clear();
        });
      }, 300);
    }
    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [faceModalVisible, currentStep]);
  const openMapModal = (location) => {
    setMapLocation(location);
    setMapModalVisible(true);
  };
  const closeMapModal = () => {
    setMapModalVisible(false);
    setMapLocation("");
  };
  const openFaceModal = (ticket, action) => {
    setCurrentTicket(ticket);
    setFaceAction(action);
    setFaceMessage(null);
    setFaceModalVisible(true);
  };

  const closeFaceModal = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
    }
    setFaceModalVisible(false);
    setFaceMessage(null);
  };
  const handleRefundRequest = (ticket) => {
    modal.confirm({
      title: "Yêu cầu hoàn vé",
      content: `Gửi yêu cầu hoàn vé ${ticket.ticketCode}?`,
      okText: "Gửi yêu cầu",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await axiosJWT.post(
            "http://localhost:3000/api/orders/request-refund",
            { ticketCode: ticket.ticketCode }
          );
          message.success("📨 Đã gửi yêu cầu hoàn vé");
          fetchUserTickets();
        } catch {
          message.error("❌ Gửi yêu cầu thất bại");
        }
      },
    });
  };
  const getMapSrc = (location) => {
    return `https://maps.google.com/maps?q=${encodeURIComponent(
      location
    )}&output=embed`;
  };
  const handleRefund = (ticket) => {
    modal.confirm({
      title: "Xác nhận hoàn vé",
      content: `Bạn chắc chắn muốn hoàn vé ${ticket.ticketCode}?`,
      okText: "Hoàn vé",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        const key = "refund";
        message.loading({ content: "⏳ Đang hoàn vé...", key, duration: 0 });

        try {
          const res = await axiosJWT.post(
            "http://localhost:3000/api/orders/refund-ticket",
            { ticketCode: ticket.ticketCode }
          );
          console.log(ticket.ticketCode);
          if (res.data.success) {
            message.success({ content: "✅ Hoàn vé thành công", key });
            fetchUserTickets();
          } else {
            message.error({ content: "❌ " + res.data.message, key });
          }
        } catch (err) {
          message.error({ content: "❌ Hoàn vé thất bại", key });
        }
      },
    });
  };

  const handleFaceConfirm = async () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    // Tránh spam khi đang xử lý
    if (faceMessage === "Đang gửi dữ liệu xác thực...") return;

    setFaceMessage("🔍 Đang phân tích khuôn mặt...");
    setFaceMessageType("success");

    try {
      const detections = await faceapi
        .detectSingleFace(videoEl, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks(true) // QUAN TRỌNG: Thêm 'true' ở đây để dùng Tiny model bạn đã load
        .withFaceDescriptor();

      if (!detections) {
        setFaceMessage("❌ Không tìm thấy khuôn mặt!");
        return;
      }

      // Nếu bạn muốn dùng logic "Chỉ 1 người" với model Tiny sẵn có:
      // Bạn phải dùng detectAllFaces nhưng cũng phải có tham số true
      const allDetections = await faceapi
        .detectAllFaces(videoEl, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks(true) // Thêm true
        .withFaceDescriptors();

      if (allDetections.length > 1) {
        setFaceMessage("❌ Phát hiện nhiều người!");
        return;
      }

      // Lấy khuôn mặt duy nhất đó ra
      const detection = allDetections[0];

      // 3. Kiểm tra vị trí (Căn giữa khung hình)
      const { x, width } = detection.detection.box;
      const videoWidth = videoEl.videoWidth;
      const faceCenterX = x + width / 2;

      // Nếu mặt lệch quá 20% so với tâm video
      if (Math.abs(faceCenterX - videoWidth / 2) > videoWidth * 0.2) {
        setFaceMessage("❌ Hãy đưa khuôn mặt vào chính giữa khung hình.");
        setFaceMessageType("error");
        return;
      }

      // 4. Gửi dữ liệu lên Server
      setFaceMessage("Đang gửi dữ liệu xác thực...");
      const faceDescriptor = Array.from(detection.descriptor);

      if (!scannedTicketCode) {
        setFaceMessage("❌ Thiếu mã vé! Vui lòng quay lại bước 1.");
        setFaceMessageType("error");
        return;
      }

      const res = await axiosJWT.post(
        "http://localhost:3000/api/checkin-order/register-face",
        {
          ticketCode: scannedTicketCode,
          faceDescriptor,
        }
      );

      if (res.data?.success) {
        setFaceMessage("✅ Thiết lập FaceID thành công!");
        setFaceMessageType("success");
        setTimeout(() => {
          closeFaceModal();
          setCurrentStep(0);
          setScannedTicketCode("");
          fetchUserTickets();
        }, 2000);
      } else {
        setFaceMessage(`❌ ${res.data.message || "Thao tác thất bại"}`);
        setFaceMessageType("error");
      }
    } catch (err) {
      console.error("Chi tiết lỗi hệ thống:", err);
      // Thông báo lỗi cụ thể để debug
      setFaceMessage(`❌ Lỗi: ${err.message || "Kết nối hệ thống thất bại"}`);
      setFaceMessageType("error");
    }
  };
  const fetchFavoriteEvents = async () => {
    if (!currentUser?.favorites || currentUser.favorites.length === 0) {
      setFavoriteEvents([]);
      return;
    }

    try {
      setLoadingFavorites(true);
      const res = await axiosJWT.post(
        "http://localhost:3000/api/event/get-multiple",
        { eventIds: currentUser.favorites }
      );
      setFavoriteEvents(res.data.data || []);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải sự kiện yêu thích!");
    } finally {
      setLoadingFavorites(false);
    }
  };
  const activeTickets = tickets.filter(
    (t) =>
      t.refundStatus !== "REFUNDED" &&
      (!t.eventDateRaw || dayjs(t.eventDateRaw).isSameOrAfter(dayjs(), "day"))
  );
  const expiredTickets = tickets.filter(
    (t) =>
      t.refundStatus !== "REFUNDED" &&
      t.eventDateRaw &&
      dayjs(t.eventDateRaw).isBefore(dayjs(), "day")
  );

  const refundedTickets = tickets.filter((t) => t.refundStatus === "REFUNDED");
  // ==============================
  // FETCH VÉ CỦA USER
  // ==============================
  const fetchUserTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const res = await axiosJWT.get(
        "http://localhost:3001/api/issued-tickets2/get-all-by-user",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = res?.data?.data || [];
      const mapped = data.map((item) => {
        const o = item.orderDetailId;
        const t = item.orderDetailId?.ticketId;
        const ev = t?.eventId;
        const loc = ev?.locations?.[0];

        return {
          ticketCode: item.ticketCode,
          isCheckedIn: item.isCheckedIn,
          refundStatus: item.refundStatus,
          status: item.status,
          checkinTime: item.checkinTime,
          seat: item.seatId?.seatNumber || "Không có",
          buyer: o?.orderId?.fullName || "",
          email: o?.orderId?.email || "",
          phone: o?.orderId?.phoneNumber || "",
          ticketName: t?.type,
          price: t?.price || 0,
          eventTitle: ev?.title || "—",
          eventDateRaw: ev?.eventDate || null, // giữ raw date
          eventDate: ev?.eventDate
            ? dayjs(ev.eventDate).format("DD/MM/YYYY")
            : "—",
          eventTime: ev?.eventStartTime
            ? `${dayjs(ev.eventStartTime).format("HH:mm")} - ${dayjs(
                ev.eventEndTime
              ).format("HH:mm")}`
            : "—",
          eventLocation: loc
            ? `${loc.address}, ${loc.ward || ""}, ${loc.district}, ${loc.city}`
            : "—",
          soldDate: item.soldDate
            ? dayjs(item.soldDate).format("DD/MM/YYYY HH:mm")
            : "—",
        };
      });

      setTickets(mapped);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải vé của bạn!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
    };
    loadModels();
  }, []);
  useEffect(() => {
    if (selectedKey === "favorite") {
      fetchFavoriteEvents();
    }
  }, [selectedKey, currentUser?.favorites]);
  useEffect(() => {
    if (selectedKey === "ticket") fetchUserTickets();
  }, [selectedKey]);
  // Bên trong UserPage component
  useEffect(() => {
    const startVideo = async () => {
      // CHỈ chạy camera FaceID khi ở Bước 1
      if (faceModalVisible && currentStep === 1) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" }, // Ưu tiên camera trước để quét mặt
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            // Quan trọng: Đợi camera load xong mới play
            videoRef.current.onloadedmetadata = () => {
              videoRef.current.play();
            };
          }
        } catch (err) {
          console.error("Lỗi camera FaceID:", err);
          message.error("Không thể truy cập camera cho FaceID!");
        }
      } else {
        // Tắt stream khi không ở Bước 1 hoặc đóng Modal
        if (videoRef.current?.srcObject) {
          videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
          videoRef.current.srcObject = null;
        }
      }
    };

    startVideo();
  }, [faceModalVisible, currentStep]); // Lắng nghe cả bước hiện tại
  const favoriteColumns = [
    {
      title: (
        <span style={{ fontWeight: 600, color: "#1890ff" }}>Tên sự kiện</span>
      ),
      dataIndex: "title",
      render: (text) => (
        <span style={{ fontWeight: 500, color: "#333" }}>{text}</span>
      ),
    },
    {
      title: <span style={{ fontWeight: 600, color: "#1890ff" }}>Ngày</span>,
      dataIndex: "eventDate",
      render: (d) => (
        <span style={{ color: "#555" }}>
          {d ? dayjs(d).format("DD/MM/YYYY") : "—"}
        </span>
      ),
    },
    {
      title: <span style={{ fontWeight: 600, color: "#1890ff" }}>Giờ</span>,
      dataIndex: "eventStartTime",
      render: (_, record) =>
        record.eventStartTime && record.eventEndTime ? (
          <span style={{ color: "#555" }}>
            {`${dayjs(record.eventStartTime).format("HH:mm")} - ${dayjs(
              record.eventEndTime
            ).format("HH:mm")}`}
          </span>
        ) : (
          "—"
        ),
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: "#1890ff" }}>Địa điểm</span>
      ),
      dataIndex: "location",
      render: (text) => (
        <span style={{ color: "#1890ff", cursor: "pointer" }}>{text}</span>
      ),
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: "#1890ff" }}>Hành động</span>
      ),
      render: (_, record) => (
        <Button
          type="link"
          style={{ padding: 0 }}
          onClick={() => (window.location.href = `/event/${record._id}`)}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  const ticketColumns = [
    {
      title: "Sự kiện",
      dataIndex: "eventTitle",
      render: (text) => <strong style={{ color: "#1a3353" }}>{text}</strong>,
    },
    { title: "Loại vé", dataIndex: "ticketName" },
    { title: "Ngày", dataIndex: "eventDate" },
    {
      title: "Địa điểm",
      dataIndex: "eventLocation",
      width: 250,
      render: (text) => (
        <span
          className="map-link"
          style={{ color: "#1890ff", cursor: "pointer", fontSize: "13px" }}
          onClick={() => openMapModal(text)}
        >
          📍 {text}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (_, record) => {
        if (record.refundStatus === "REFUNDED")
          return <Tag color="error">Đã hoàn tiền</Tag>;
        if (record.isCheckedIn) return <Tag color="success">Đã sử dụng</Tag>;
        return <Tag color="processing">Sẵn sàng</Tag>;
      },
    },

    {
      title: "Thao tác",
      render: (_, record) => {
        if (!record.isCheckedIn && record.refundStatus === "NONE") {
          return (
            <Button
              type="link"
              danger
              onClick={() => handleRefundRequest(record)}
            >
              Hoàn vé
            </Button>
          );
        }
        return <small style={{ color: "#ccc" }}>N/A</small>;
      },
    },
  ];

  const renderContent = () => {
    switch (selectedKey) {
      case "event":
        return (
          <>
            <h2 className="content-title">Sự kiện của tôi</h2>
            <UserEvent />
          </>
        );
      case "ticket":
        return (
          <>
            <h2 className="content-title">Vé đã mua</h2>
            <Button
              type="primary"
              icon={<SettingOutlined />}
              size="large"
              onClick={() => {
                setCurrentStep(0);
                setScannedTicketCode("");
                setFaceMessage(null);
                setFaceModalVisible(true);
                setFaceAction("register");
              }}
              style={{ borderRadius: "8px", fontWeight: 600 }}
            >
              Thiết lập FaceID bằng QR
            </Button>
            <Tabs defaultActiveKey="active">
              <Tabs.TabPane tab="Còn hiệu lực" key="active">
                <Table
                  dataSource={activeTickets}
                  columns={ticketColumns}
                  loading={loading}
                  rowKey="ticketCode"
                  pagination={{ pageSize: 10 }}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab="Đã hết hạn" key="expired">
                <Table
                  dataSource={expiredTickets}
                  columns={ticketColumns}
                  loading={loading}
                  rowKey="ticketCode"
                  pagination={{ pageSize: 10 }}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab="Đã hoàn" key="refunded">
                <Table
                  dataSource={refundedTickets}
                  columns={ticketColumns}
                  loading={loading}
                  rowKey="ticketCode"
                  pagination={{ pageSize: 10 }}
                />
              </Tabs.TabPane>
            </Tabs>
          </>
        );

      case "favorite":
        return (
          <>
            <h2 className="content-title">Sự kiện yêu thích</h2>
            {favoriteEvents.length === 0 ? (
              <div className="placeholder-card">
                <p>Những sự kiện bạn đã lưu sẽ xuất hiện ở đây</p>
              </div>
            ) : (
              <Table
                dataSource={favoriteEvents}
                columns={favoriteColumns}
                rowKey="_id"
                loading={loadingFavorites}
                pagination={{ pageSize: 10 }}
              />
            )}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="user-page-container">
      {contextHolder}
      <HeaderComponent isHiddenSearch isHiddenCart />

      <div className="user-page-wrapper">
        {/* Sidebar */}
        <div className={`user-sidebar ${collapsed ? "collapsed" : ""}`}>
          <div className="sidebar-toggle">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
            />
          </div>
          <Menu
            mode="inline"
            inlineCollapsed={collapsed}
            selectedKeys={[selectedKey]}
            onClick={({ key }) => setSelectedKey(key)}
            items={menuItems}
          />
        </div>

        {/* Content Area */}
        <div className="user-main-content">{renderContent()}</div>
      </div>

      {/* Modal Face ID - Nâng cấp giao diện Modal */}
      <Modal
        open={faceModalVisible}
        title="Thiết lập FaceID cho vé"
        onCancel={() => {
          closeFaceModal();
          setCurrentStep(0);
          setScannedTicketCode("");
        }}
        footer={[
          currentStep === 0 && (
            <Button
              key="next"
              type="primary"
              disabled={!scannedTicketCode}
              onClick={() => setCurrentStep(1)}
            >
              Tiếp theo: Quét mặt
            </Button>
          ),
          currentStep === 1 && (
            <Button key="back" onClick={() => setCurrentStep(0)}>
              Quay lại
            </Button>
          ),
          currentStep === 1 && (
            <Button key="submit" type="primary" onClick={handleFaceConfirm}>
              Xác nhận thiết lập
            </Button>
          ),
        ]}
        width={500}
      >
        <Steps
          current={currentStep}
          items={[{ title: "Quét QR" }, { title: "Quét FaceID" }]}
          style={{ marginBottom: 20 }}
        />

        {/* Bước 1: Quét QR */}
        {currentStep === 0 && (
          <div style={{ textAlign: "center" }}>
            <p>Vui lòng quét mã QR trên vé để xác định vé cần thiết lập.</p>
            <div id="qr-reader-register" style={{ width: "100%" }}></div>
            {scannedTicketCode && (
              <div style={{ marginTop: 10 }}>
                <Tag color="blue">Mã vé đã chọn: {scannedTicketCode}</Tag>
              </div>
            )}
          </div>
        )}

        {/* Bước 2: Quét FaceID (Giữ nguyên logic video cũ của bạn) */}
        {currentStep === 1 && (
          <div className="face-scan-container">
            <div className="video-box">
              <video
                ref={videoRef}
                width="100%"
                autoPlay
                muted
                playsInline
                style={{
                  transform: "scaleX(-1)",
                  display: currentStep === 1 ? "block" : "none", // Chỉ hiện khi tới bước
                  background: "#000",
                }}
              />
              <div className="scan-overlay">
                <div className="scan-line"></div>
              </div>
            </div>
            {faceMessage && <div style={{ marginTop: 10 }}>{faceMessage}</div>}
          </div>
        )}
      </Modal>

      {/* Modal Map */}
      <Modal
        open={mapModalVisible}
        title="📍 Vị trí sự kiện"
        onCancel={closeMapModal}
        footer={null}
        width={800}
        centered
      >
        {mapLocation && (
          <iframe
            width="100%"
            height="450"
            style={{ border: 0, borderRadius: "8px" }}
            loading="lazy"
            allowFullScreen
            src={`https://maps.google.com/maps?q=${encodeURIComponent(
              mapLocation
            )}&output=embed`}
          />
        )}
      </Modal>
    </div>
  );
};

export default UserPage;

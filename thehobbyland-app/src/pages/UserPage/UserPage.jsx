import React, { useState, useEffect, useRef } from "react";
import { Menu, Table, Tag, message, Modal, Button } from "antd";
import {
  CalendarOutlined,
  AccountBookOutlined,
  HeartOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import HeaderComponent from "../../components/HeaderComponent/HeaderComponent";
import UserEvent from "../../components/UserEvent/UserEvent";
import { axiosJWT } from "../../services/UserService";
import dayjs from "dayjs";
import "./UserPage.css";
import * as faceapi from "face-api.js";
import { useSelector } from "react-redux";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";

const menuItems = [
  { key: "event", icon: <CalendarOutlined />, label: "Sự kiện của tôi" },
  { key: "ticket", icon: <AccountBookOutlined />, label: "Vé đã mua" },
  { key: "favorite", icon: <HeartOutlined />, label: "Yêu thích" },
];

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
    setFaceModalVisible(true);
  };

  const closeFaceModal = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
    }
    setFaceModalVisible(false);
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

    // Tạo canvas tạm để chụp frame
    const canvas = document.createElement("canvas");
    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

    const detections = await faceapi
      .detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks(true)
      .withFaceDescriptor();

    if (!detections) {
      message.error("Không phát hiện gương mặt!");
      return;
    }

    const faceDescriptor = Array.from(detections.descriptor);

    try {
      if (faceAction === "register") {
        await axiosJWT.post("http://localhost:3000/api/orders/register-face", {
          ticketCode: currentTicket.ticketCode,
          faceDescriptor,
        });

        message.success("Đăng ký Face ID thành công!");
      } else {
        const res = await axiosJWT.post(
          "http://localhost:3000/api/orders/checkin-face",
          {
            ticketCode: currentTicket.ticketCode,
            faceDescriptor,
          }
        );

        if (res.data.success) message.success(res.data.message);
        else message.error(res.data.message);
      }
      fetchUserTickets();
    } catch (err) {
      console.error(err);
      message.error("Xử lý thất bại!");
    } finally {
      closeFaceModal();
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
          refundStatus: item.refundStatus, // ⭐ thêm
          status: item.status,
          checkinTime: item.checkinTime,
          seat: item.seatId?.seatNumber || "Không có",
          buyer: o?.orderId?.fullName || "",
          email: o?.orderId?.email || "",
          phone: o?.orderId?.phoneNumber || "",
          ticketName: t?.type,
          price: t?.price || 0,
          eventTitle: ev?.title || "—",
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
      if (faceModalVisible) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
          }
        } catch (err) {
          console.error("Không thể mở camera:", err);
          message.error("Không thể truy cập camera!");
          setFaceModalVisible(false);
        }
      } else {
        // stop video khi đóng modal
        if (videoRef.current?.srcObject) {
          videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
        }
      }
    };

    startVideo();
  }, [faceModalVisible]);
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
    { title: "Tên vé", dataIndex: "ticketName" },
    { title: "Sự kiện", dataIndex: "eventTitle" },
    { title: "Ngày", dataIndex: "eventDate" },
    { title: "Giờ", dataIndex: "eventTime" },
    {
      title: "Địa điểm",
      dataIndex: "eventLocation",
      width: 220,
      render: (text) => (
        <span
          style={{
            color: "#1890ff",
            cursor: "pointer",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
          onClick={() => openMapModal(text)}
          title={text}
        >
          {text}
        </span>
      ),
    },

    {
      title: "Giá",
      dataIndex: "price",
      render: (v) => `${v.toLocaleString()} VND`,
    },
    {
      title: "Check-in",
      dataIndex: "isCheckedIn",
      render: (v) =>
        v ? (
          <Tag color="green">Đã Check-in</Tag>
        ) : (
          <Tag color="orange">Chưa Check-in</Tag>
        ),
    },
    {
      title: "Face ID",
      render: (_, record) =>
        record.isCheckedIn ? (
          <Tag color="green">Đã Check-in</Tag>
        ) : (
          <Button onClick={() => openFaceModal(record, "register")}>
            Đăng ký Face ID
          </Button>
        ),
    },
    {
      title: "Thời gian check-in",
      dataIndex: "checkinTime",
      render: (v) => (v ? dayjs(v).format("DD/MM/YYYY HH:mm") : "—"),
    },
    { title: "Ngày mua", dataIndex: "soldDate" },
    {
      title: "Trạng thái vé",
      dataIndex: "status",
      render: (_, record) => {
        if (record.refundStatus === "REFUNDED") {
          return <Tag color="red">Đã hoàn</Tag>;
        }
        if (record.isCheckedIn) {
          return <Tag color="green">Đã check-in</Tag>;
        }
        return <Tag color="blue">Còn hiệu lực</Tag>;
      },
    },

    {
      title: "Hoàn vé",
      render: (_, record) => {
        // Đã check-in thì cấm hoàn
        if (record.isCheckedIn) {
          return <Tag color="default">Không thể hoàn</Tag>;
        }

        switch (record.refundStatus) {
          case "NONE":
            return (
              <Button danger onClick={() => handleRefundRequest(record)}>
                Yêu cầu hoàn
              </Button>
            );

          case "REQUESTED":
            return <Tag color="orange">Chờ host duyệt</Tag>;

          case "APPROVED":
            return <Tag color="blue">Đã duyệt</Tag>;

          case "REJECTED":
            return <Tag color="red">Bị từ chối</Tag>;

          case "REFUNDED":
            return <Tag color="green">Đã hoàn</Tag>;

          default:
            return "—";
        }
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
            <Table
              dataSource={tickets}
              columns={ticketColumns}
              loading={loading}
              rowKey="ticketCode"
              pagination={{ pageSize: 10 }}
            />
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
    <>
      {contextHolder}
      <HeaderComponent isHiddenSearch isHiddenCart />
      <div className="user-page-container">
        <div className="user-page-wrapper">
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

          <div className="user-main-content">{renderContent()}</div>
        </div>
      </div>

      {/* Modal Face ID */}
      <Modal
        visible={faceModalVisible}
        title={
          faceAction === "register" ? "Đăng ký Face ID" : "Check-in Face ID"
        }
        onCancel={closeFaceModal}
        onOk={handleFaceConfirm}
      >
        <video ref={videoRef} width="100%" height="auto" />
      </Modal>
      <Modal
        visible={mapModalVisible}
        title="Bản đồ địa điểm"
        onCancel={closeMapModal}
        footer={null}
        width={600}
      >
        {mapLocation && (
          <iframe
            width="100%"
            height="400"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={`https://www.google.com/maps?q=${encodeURIComponent(
              mapLocation
            )}&output=embed`}
          />
        )}
      </Modal>
    </>
  );
};

export default UserPage;

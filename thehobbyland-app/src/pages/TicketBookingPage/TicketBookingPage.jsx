import React, { useState, useEffect, useCallback } from "react";
import {
  AlertTriangle,
  Clock,
  Minus,
  Plus,
  Loader2,
  CheckCircle,
  XCircle,
  Info,
  Zap,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
// Giả định BillSummary đã được import chính xác
import BillSummary from "../../components/BillSummary/BillSummary";

// --- CÁC HẰNG SỐ VÀ STYLE ---

const COLORS = {
  primary: "#2DC275", // green-600
  primaryLight: "#eef2ff", // indigo-50
  secondary: "#1f2937", // gray-800
  background: "#f9fafb", // gray-50
  success: "#10b981", // green-600
  error: "#ef4444", // red-500
  warning: "#f97316", // orange-600
  held: "#f59e0b", // yellow-600
  border: "#d1d5db", // gray-300
};

const styles = {
  appContainer: {
    minHeight: "100vh",
    backgroundColor: COLORS.background,
    padding: "2rem 1rem",
    fontFamily: '"Inter", sans-serif',
  },
  mainContent: {
    maxWidth: "72rem",
    margin: "0 auto",
  },
  header: {
    textAlign: "center",
    marginBottom: "2.5rem",
    padding: "2rem",
    backgroundColor: "white",
    boxShadow:
      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    borderRadius: "1rem",
    borderTop: `8px solid ${COLORS.primary}`,
  },
  cardList: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: COLORS.background,
  },
  loadingCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "2.5rem",
    backgroundColor: "white",
    borderRadius: "1rem",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    color: COLORS.primary,
    gap: "0.75rem",
  },
};

const API_BASE_URL = "http://localhost:3001";

// --- HÀM TÍNH TOÁN ---

/**
 * Tính tổng số lượng và tổng tiền từ danh sách vé và số lượng đã chọn.
 */
const calculateBillFromQuantities = (allTickets, quantities) => {
  return allTickets.reduce(
    (acc, t) => {
      const qty = quantities[t._id] || 0;
      acc.totalQuantity += qty;
      acc.totalPrice += t.price * qty;
      return acc;
    },
    { totalQuantity: 0, totalPrice: 0 }
  );
};

// --- COMPONENT CHÍNH ---

const TicketBookingPage = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const currentUserId = useSelector((state) => state.user?.id);

  // State
  const [tickets, setTickets] = useState([]);
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [toast, setToast] = useState(null);
  const [currentHoldId, setCurrentHoldId] = useState(null);

  // Hàm hiển thị Toast Notification
  const showToast = useCallback((message, type, duration = 3000) => {
    setToast({ message, type });
    const timer = setTimeout(() => setToast(null), duration);
    return () => clearTimeout(timer);
  }, []);

  // Hàm gọi API Backend để lấy danh sách vé (Đã tối ưu dependencies)
  const fetchTickets = useCallback(async () => {
    if (!eventId) {
      setError("Lỗi: Không tìm thấy Event ID trong URL.");
      setLoading(false);
      return;
    }

    // Chỉ set loading/fetching nếu chưa có dữ liệu vé
    if (tickets.length === 0) setLoading(true);
    setIsFetching(true);
    setError(null);

    const url = `${API_BASE_URL}/api/tickets/event/${eventId}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Lỗi HTTP: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === "OK") {
        setTickets(result.data); // Chỉ cập nhật tickets
      } else {
        throw new Error(result.message || "Phản hồi API không hợp lệ.");
      }
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu vé:", err);
      if (tickets.length === 0) {
        setError(
          `Không thể kết nối đến Backend (${API_BASE_URL}) hoặc lỗi: ${err.message}`
        );
      } else {
        showToast("Lỗi cập nhật kho vé. Vui lòng kiểm tra kết nối.", "error");
      }
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  }, [eventId, showToast, tickets.length]);
  // tickets.length chỉ dùng để kiểm tra hiển thị loading/error, không gây re-render loop

  // Hàm cập nhật số lượng vé đã chọn
  const updateQuantity = useCallback(
    (ticketId, newQty) => {
      setSelectedQuantities((prev) => {
        const updated = { ...prev, [ticketId]: newQty };

        // Tính toán tổng
        const { totalQuantity, totalPrice } = calculateBillFromQuantities(
          tickets,
          updated
        );

        // Lưu vào localStorage dùng `updated` chứ không dùng `selectedQuantities`
        localStorage.setItem(
          "ticketBill",
          JSON.stringify({
            selectedTickets: tickets
              .map((t) => ({
                _id: t._id,
                name: t.type,
                price: t.price,
                quantity: updated[t._id] || 0,
              }))
              .filter((t) => t.quantity > 0),
            totalQuantity,
            totalPrice,
          })
        );

        setTotalQuantity(totalQuantity);
        setTotalPrice(totalPrice);

        return updated;
      });
    },
    [tickets] // Vẫn cần tickets để tính toán
  );

  // --- HÀM GIỮ VÉ (HOLD) ---

  const handleHoldTickets = async (ticketId, ticketName, quantity) => {
    if (quantity <= 0) {
      return;
    }

    if (!currentUserId) {
      showToast("Bạn cần đăng nhập để đặt vé.", "error");
      return;
    }

    const payload = {
      showtimeId: eventId,
      userId: currentUserId,
      ticketId: ticketId,
      quantity: quantity,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/tickets/hold`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.status !== "OK") {
        throw new Error(result.message);
      }

      return {
        success: true,
        holdId: result.data.holdId,
        message: `Đã giữ ${quantity} vé ${ticketName}.`,
      };
    } catch (err) {
      return {
        success: false,
        message: `Giữ vé ${ticketName} thất bại: ${err.message}`,
      };
    }
  };

  const handleHoldAllTickets = async () => {
    const ticketsToHold = tickets
      .map((ticket) => ({
        ...ticket,
        quantity: selectedQuantities[ticket._id] || 0,
      }))
      .filter((ticket) => ticket.quantity > 0);

    if (!ticketsToHold.length) {
      showToast("Chưa có vé hợp lệ để giữ.", "warning");
      return;
    }

    showToast("Đang xử lý giữ vé...", "info");

    try {
      const holdPromises = ticketsToHold.map((ticket) =>
        handleHoldTickets(ticket._id, ticket.name, ticket.quantity)
      );

      const results = await Promise.all(holdPromises);

      const failedHolds = results.filter((res) => !res.success);
      const successfulHolds = results.filter((res) => res.success);

      if (failedHolds.length > 0) {
        const errorMessages = failedHolds.map((f) => f.message).join(" | ");
        showToast(
          `Giữ vé thất bại (${failedHolds.length} loại vé): ${errorMessages}`,
          "error",
          8000
        );
      }

      // Thay thế đoạn navigate cũ bằng đoạn này:

      if (successfulHolds.length > 0) {
        const holdId = successfulHolds[0].holdId;

        // TẠO DỮ LIỆU CẦN TRUYỀN QUA STATE
        const checkoutData = {
          selectedQuantities: selectedQuantities,
          totalQuantity: totalQuantity,
          totalPrice: totalPrice,
          tickets: tickets, // Toàn bộ danh sách vé
        };

        // Xóa localStorage (vì đã có dữ liệu trong state)
        // localStorage.removeItem("ticketBill");

        showToast(
          "Đã giữ vé thành công! Đang chuyển hướng đến trang thanh toán.",
          "success"
        );

        // TRUYỀN DỮ LIỆU QUA NAVIGATION STATE
        navigate("/checkout", {
          state: {
            holdId: holdId,
            checkoutData: checkoutData, // <--- TRUYỀN DATA MỚI
          },
        });
      } else if (failedHolds.length === ticketsToHold.length) {
        showToast("Không giữ được vé nào. Vui lòng kiểm tra lại.", "error");
      }
    } catch (err) {
      showToast(`Lỗi không xác định khi giữ vé: ${err.message}`, "error");
    }
  };

  // --- USE EFFECT VÀ LOGIC TẢI ---

  // 1. Tải dữ liệu từ localStorage và thiết lập Interval gọi API
  useEffect(() => {
    // Tải dữ liệu từ localStorage
    const savedBill = JSON.parse(localStorage.getItem("ticketBill"));
    if (savedBill) {
      setSelectedQuantities(savedBill.selectedQuantities || {});
      setTotalQuantity(savedBill.totalQuantity || 0);
      setTotalPrice(savedBill.totalPrice || 0);
    }

    // Tải danh sách vé và thiết lập cập nhật định kỳ
    if (eventId) {
      fetchTickets();
      const interval = setInterval(fetchTickets, 5000);
      return () => clearInterval(interval);
    }
  }, [eventId, fetchTickets]);

  // 2. Khởi tạo selectedQuantities khi tickets được tải lần đầu
  // Chỉ chạy khi tickets có dữ liệu VÀ selectedQuantities rỗng
  useEffect(() => {
    const hasTickets = tickets.length > 0;
    const isQuantitiesEmpty = Object.keys(selectedQuantities).length === 0;

    if (hasTickets && isQuantitiesEmpty) {
      const initialTicketId = tickets[0]._id;
      const initialQuantities = { [initialTicketId]: 1 };

      // Set state
      setSelectedQuantities(initialQuantities);

      // Tính toán và lưu localStorage ngay lập tức
      const { totalQuantity, totalPrice } = calculateBillFromQuantities(
        tickets,
        initialQuantities
      );
      setTotalQuantity(totalQuantity);
      setTotalPrice(totalPrice);

      localStorage.setItem(
        "ticketBill",
        JSON.stringify({
          selectedTickets: tickets
            .map((t) => ({
              _id: t._id,
              name: t.type,
              price: t.price,
              quantity: initialQuantities[t._id] || 0,
            }))
            .filter((t) => t.quantity > 0),
          totalQuantity,
          totalPrice,
        })
      );
    }
  }, [tickets, selectedQuantities]); // Kích hoạt khi tickets được fetch, dừng lại khi selectedQuantities có giá trị

  // 3. Cập nhật state tổng tiền/số lượng khi selectedQuantities thay đổi
  // (Đã tích hợp vào updateQuantity để BillSummary render ngay lập tức, nhưng vẫn giữ đây làm fallback/kiểm tra)
  // Trong trường hợp này, useEffect này có thể được loại bỏ vì updateQuantity đã đảm nhiệm logic setTotal/setPrice.
  /*
  useEffect(() => {
    const { totalQuantity, totalPrice } = calculateBillFromQuantities(
      tickets,
      selectedQuantities
    );
    // Nếu giá trị KHÔNG thay đổi so với state hiện tại, React sẽ không re-render
    setTotalQuantity(totalQuantity); 
    setTotalPrice(totalPrice);
  }, [tickets, selectedQuantities]); 
  */

  // --- COMPONENT CON UI (Không thay đổi) ---

  // Toast Notification Component
  const ToastNotification = ({ message, type }) => {
    const toastStyles = {
      base: {
        position: "fixed",
        top: "1rem",
        right: "1rem",
        padding: "1rem",
        borderRadius: "0.75rem",
        boxShadow:
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        zIndex: 50,
        transition: "transform 300ms ease-out",
        display: "flex",
        alignItems: "center",
        minWidth: "300px",
        fontFamily: '"Inter", sans-serif',
      },
      success: { backgroundColor: COLORS.success, color: "white" },
      error: { backgroundColor: COLORS.error, color: "white" },
      warning: { backgroundColor: COLORS.warning, color: "white" },
      info: { backgroundColor: COLORS.primary, color: "white" },
      icon: {
        width: "1.5rem",
        height: "1.5rem",
        marginRight: "0.75rem",
        flexShrink: 0,
      },
      message: { fontWeight: "500", fontSize: "1rem" },
    };

    let icon, colorStyle;

    switch (type) {
      case "success":
        icon = <CheckCircle style={toastStyles.icon} />;
        colorStyle = toastStyles.success;
        break;
      case "error":
        icon = <XCircle style={toastStyles.icon} />;
        colorStyle = toastStyles.error;
        break;
      case "warning":
        icon = <AlertTriangle style={toastStyles.icon} />;
        colorStyle = toastStyles.warning;
        break;
      case "info":
      default:
        icon = (
          <Info
            style={{ ...toastStyles.icon, animation: "pulse 2s infinite" }}
          />
        );
        colorStyle = toastStyles.info;
        break;
    }

    return (
      <div style={{ ...toastStyles.base, ...colorStyle }}>
        {icon}
        <span style={toastStyles.message}>{message}</span>
      </div>
    );
  };

  // Hàm định dạng tiền tệ Việt Nam
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // QuantitySelector Component
  const QuantitySelector = React.memo(
    ({ ticketId, maxQuantity, quantity, onChange }) => {
      const handleIncrease = () => {
        if (quantity < maxQuantity) {
          onChange(ticketId, quantity + 1);
        }
      };

      const handleDecrease = () => {
        if (quantity > 0) {
          onChange(ticketId, quantity - 1);
        }
      };

      const buttonBaseStyle = {
        width: "40px",
        height: "100%",
        background: "#f3f4f6",
        border: "none",
        fontSize: "1.25rem",
        cursor: "pointer",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: COLORS.secondary,
        transition: "background-color 200ms",
      };

      const disabledStyle = {
        cursor: "not-allowed",
        opacity: 0.5,
      };

      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            border: `1px solid ${COLORS.border}`,
            borderRadius: "8px",
            overflow: "hidden",
            width: "120px",
            height: "40px",
          }}
        >
          {/* Nút trừ */}
          <button
            onClick={handleDecrease}
            disabled={quantity <= 0}
            style={{
              ...buttonBaseStyle,
              ...(quantity <= 0 ? disabledStyle : {}),
            }}
          >
            <Minus size={16} />
          </button>

          {/* Số lượng */}
          <div
            style={{
              flex: 1,
              textAlign: "center",
              fontWeight: "600",
            }}
          >
            {quantity}
          </div>

          {/* Nút cộng */}
          <button
            onClick={handleIncrease}
            disabled={quantity >= maxQuantity}
            style={{
              ...buttonBaseStyle,
              ...(quantity >= maxQuantity ? disabledStyle : {}),
            }}
          >
            <Plus size={16} />
          </button>
        </div>
      );
    }
  );

  // Card hiển thị thông tin vé
  const TicketCard = ({ ticket }) => {
    const isSoldOut = ticket.availability <= 0;
    const isLowStock = ticket.availability > 0 && ticket.availability <= 10;
    const selectedQty = selectedQuantities[ticket._id] || 0;
    const totalCost = ticket.price * selectedQty;

    const statusColor = isSoldOut
      ? COLORS.error
      : isLowStock
      ? COLORS.warning
      : COLORS.success;

    const baseCardStyle = {
      padding: "2rem 2rem",
      border: `1px solid ${COLORS.border}`,
      borderRadius: "1rem",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "1.25rem",
      transition: "box-shadow 300ms, opacity 300ms",
    };

    const cardStyle = {
      ...baseCardStyle,
      backgroundColor: isSoldOut ? "#f3f4f6" : "white",
      opacity: isSoldOut ? 0.9 : 1,
      borderLeft: `4px solid ${isSoldOut ? "#9ca3af" : COLORS.primary}`,
    };

    return (
      <div style={cardStyle}>
        <div
          style={{
            display: "flex",
            width: "100%",
            flexWrap: "wrap",
            gap: "1.5rem",
          }}
        >
          {/* 1. Tên vé & Giá */}
          <div style={{ flexGrow: 1, minWidth: "200px", paddingRight: "1rem" }}>
            <h3
              style={{
                fontSize: "1.5rem",
                fontWeight: "800",
                color: isSoldOut ? "#6b7280" : COLORS.secondary,
                textDecoration: isSoldOut ? "line-through" : "none",
              }}
            >
              {ticket.name}
            </h3>
            <p
              style={{
                marginTop: "0.25rem",
                fontSize: "1.875rem",
                fontWeight: "900",
                color: isSoldOut ? "#9ca3af" : COLORS.error,
              }}
            >
              {formatCurrency(ticket.price)}
            </p>
            <div
              style={{
                marginTop: "0.75rem",
                fontSize: "0.875rem",
                color: COLORS.primary,
                fontWeight: "500",
                backgroundColor: COLORS.primaryLight,
                padding: "0.5rem",
                borderRadius: "0.5rem",
                display: "inline-block",
              }}
            >
              {selectedQty > 0
                ? `Tổng tiền: ${formatCurrency(totalCost)}`
                : "Chọn số lượng để đặt"}
            </div>
          </div>

          {/* 2. Trạng thái số lượng */}
          <div
            style={{
              minWidth: "200px",
              paddingLeft: "1.5rem",
              borderLeft: "1px solid #e5e7eb",
              fontSize: "0.875rem",
              color: "#4b5563",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              justifyContent: "center",
            }}
          >
            <h4
              style={{
                fontSize: "1rem",
                fontWeight: "bold",
                color: "#374151",
                marginBottom: "0.5rem",
              }}
            >
              Thông tin Kho vé:
            </h4>
            {/* Đang giữ */}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ display: "flex", alignItems: "center" }}>
                <Clock
                  size={16}
                  style={{ marginRight: "0.25rem", color: COLORS.held }}
                />
                Đang giữ (15p):
              </span>
              <span style={{ fontWeight: "800", color: COLORS.held }}>
                {ticket.heldCount}
              </span>
            </div>
            {/* Đã bán */}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Đã bán:</span>
              <span style={{ fontWeight: "800", color: COLORS.secondary }}>
                {ticket.sold}
              </span>
            </div>
            {/* Tổng số vé */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                borderTop: "1px solid #f3f4f6",
                paddingTop: "0.5rem",
              }}
            >
              <span>Tổng số vé:</span>
              <span style={{ fontWeight: "bold", color: "#374151" }}>
                {ticket.quantity - ticket.heldCount}
              </span>
            </div>
          </div>

          {/* 3. Số lượng còn lại & Chọn mua */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "1rem",
              minWidth: "250px",
              paddingTop: "1rem",
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem",
                backgroundColor: COLORS.primaryLight,
                borderRadius: "0.75rem",
                width: "100%",
                justifyContent: "space-between",
              }}
            >
              {/* Trạng thái còn lại */}
              <div
                style={{
                  fontSize: "1rem",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  color: statusColor,
                }}
              >
                {isSoldOut ? (
                  <>
                    <XCircle size={20} style={{ marginRight: "0.5rem" }} /> HẾT
                    VÉ
                  </>
                ) : isLowStock ? (
                  <>
                    <Zap
                      size={20}
                      style={{
                        marginRight: "0.5rem",
                        animation: "pulse 1s infinite",
                      }}
                    />
                    SẮP HẾT
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} style={{ marginRight: "0.5rem" }} />
                    CÒN LẠI
                  </>
                )}
              </div>
              {/* Số lượng khả dụng */}
              <div
                style={{
                  fontSize: "2.25rem",
                  fontWeight: "900",
                  letterSpacing: "-0.025em",
                  color: statusColor,
                }}
              >
                {ticket.availability}
              </div>
            </div>

            {/* Bộ chọn số lượng */}
            {!isSoldOut && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  width: "100%",
                  justifyContent: "flex-end",
                }}
              >
                <QuantitySelector
                  ticketId={ticket._id}
                  maxQuantity={ticket.availability}
                  quantity={selectedQuantities[ticket._id] || 0}
                  onChange={updateQuantity}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // --- RENDER CHÍNH ---

  // Hiển thị Loading
  if (loading && tickets.length === 0) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingCard}>
          <Loader2
            style={{
              width: "2.5rem",
              height: "2.5rem",
              animation: "spin 1s linear infinite",
            }}
          />
          <span style={{ fontSize: "1.25rem", fontWeight: "600" }}>
            Đang tải danh sách vé...
          </span>
        </div>
        <style>
          {`
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
          `}
        </style>
      </div>
    );
  }

  // Hiển thị Lỗi kết nối/Event ID
  if (error && tickets.length === 0) {
    const errorCardStyle = {
      padding: "2rem",
      backgroundColor: "white",
      borderLeft: `8px solid ${COLORS.error}`,
      borderRadius: "1rem",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      maxWidth: "72rem",
      margin: "2.5rem auto",
    };

    return (
      <div style={errorCardStyle}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            color: COLORS.error,
          }}
        >
          <AlertTriangle
            style={{
              width: "2rem",
              height: "2rem",
              marginRight: "1rem",
              marginTop: "0.25rem",
              flexShrink: 0,
            }}
          />
          <div>
            <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              Lỗi Kết Nối hoặc Dữ liệu
            </p>
            <p
              style={{
                marginTop: "0.75rem",
                fontSize: "1rem",
                color: COLORS.error,
                fontWeight: "500",
              }}
            >
              {error}
            </p>
            <p
              style={{
                marginTop: "1rem",
                fontSize: "0.875rem",
                fontStyle: "italic",
                color: "#6b7280",
              }}
            >
              Event ID:
              <span style={{ fontFamily: "monospace" }}>{eventId}</span>. Vui
              lòng đảm bảo Backend đang chạy.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render Component Chính
  return (
    <div style={styles.appContainer}>
      <style>
        {`
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
          `}
      </style>

      {toast && <ToastNotification message={toast.message} type={toast.type} />}

      <div style={styles.mainContent}>
        {/* Header */}
        <header style={styles.header}>
          <h1
            style={{
              fontSize: "2.25rem",
              fontWeight: "800",
              color: COLORS.secondary,
              letterSpacing: "-0.025em",
            }}
          >
            Giao diện Đặt vé Sự kiện
          </h1>
          <p
            style={{
              fontSize: "1.125rem",
              color: "#6b7280",
              marginTop: "0.5rem",
            }}
          >
            Hệ thống Giữ chỗ (Holding System) theo thời gian thực
          </p>
          <div
            style={{
              marginTop: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.875rem",
              color: "#6b7280",
              gap: "1rem",
            }}
          >
            <span style={{ display: "flex", alignItems: "center" }}>
              <Clock
                size={16}
                style={{
                  marginRight: "0.25rem",
                  color: "#3b82f6",
                  animation: "pulse 1s infinite",
                }}
              />
              Cập nhật:
              <span style={{ fontWeight: "600", marginLeft: "0.25rem" }}>
                5 giây/lần
              </span>
              {isFetching && (
                <Loader2
                  size={16}
                  style={{
                    marginLeft: "0.5rem",
                    animation: "spin 1s linear infinite",
                    color: COLORS.primary,
                  }}
                />
              )}
            </span>
            <div
              style={{
                height: "1rem",
                width: "1px",
                backgroundColor: "#d1d5db",
              }}
            ></div>
            <span
              style={{
                fontSize: "0.75rem",
                color: COLORS.primary,
                fontWeight: "500",
              }}
            >
              Event ID:
              <span style={{ fontFamily: "monospace", fontWeight: "bold" }}>
                {eventId}
              </span>
            </span>
          </div>
          <p
            style={{
              marginTop: "0.5rem",
              fontSize: "0.75rem",
              color: "#9ca3af",
            }}
          >
            User ID (Mock): {currentUserId}
          </p>
        </header>

        {/* Danh sách vé và Bill Summary */}
        <div style={styles.cardList}>
          {tickets.length > 0
            ? tickets.map((ticket) => (
                <TicketCard key={ticket._id} ticket={ticket} />
              ))
            : !loading &&
              !error && (
                <div
                  style={{
                    padding: "2rem",
                    backgroundColor: "#fffbe3",
                    borderLeft: "4px solid #f59e0b",
                    color: "#b45309",
                    borderRadius: "0.5rem",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <p style={{ fontWeight: "600", fontSize: "1.125rem" }}>
                    Không tìm thấy loại vé nào cho sự kiện này.
                  </p>
                  <p style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>
                    Vui lòng kiểm tra lại Event ID: {eventId} hoặc dữ liệu trong
                    MongoDB.
                  </p>
                </div>
              )}

          {/* Bill Summary - Sử dụng state đã cập nhật */}
          <BillSummary
            tickets={tickets}
            selectedQuantities={selectedQuantities}
            totalQuantity={totalQuantity}
            totalPrice={totalPrice}
            onHold={handleHoldAllTickets}
          />
        </div>
      </div>
    </div>
  );
};

export default TicketBookingPage;

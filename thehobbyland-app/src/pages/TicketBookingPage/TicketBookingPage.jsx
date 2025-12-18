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
  Ticket,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import BillSummary from "../../components/BillSummary/BillSummary";

const COLORS = {
  primary: "#1e293b",
  secondary: "#1e293b",
  accent: "#3b82f6",
  background: "#f1f5f9",
  surface: "#ffffff",
  border: "#e2e8f0",
  textMuted: "#64748b",
  held: "#f59e0b",
  error: "#ef4444",
};

const API_BASE_URL = "http://localhost:3001";

const TicketBookingPage = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const currentUserId = useSelector((state) => state.user?.id);

  const [tickets, setTickets] = useState([]);
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [toast, setToast] = useState(null);

  // Helper định dạng tiền
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const showToast = useCallback((message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchTickets = useCallback(async () => {
    if (!eventId) return;
    setIsFetching(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/tickets/event/${eventId}`
      );
      const result = await response.json();
      if (result.status === "OK") {
        setTickets(result.data);
      }
    } catch (err) {
      if (tickets.length === 0) setError("Không thể kết nối đến máy chủ.");
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  }, [eventId, tickets.length]);

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 5000);
    return () => clearInterval(interval);
  }, [fetchTickets]);

  const updateQuantity = useCallback(
    (ticketId, newQty) => {
      setSelectedQuantities((prev) => {
        const updated = { ...prev, [ticketId]: newQty };

        // Tính toán bill
        let totalQty = 0;
        let totalP = 0;
        tickets.forEach((t) => {
          const q = updated[t._id] || 0;
          totalQty += q;
          totalP += q * t.price;
        });

        setTotalQuantity(totalQty);
        setTotalPrice(totalP);
        return updated;
      });
    },
    [tickets]
  );

  // --- HÀM GIỮ VÉ VÀ TRUYỀN DỮ LIỆU ---
  const handleHoldAllTickets = async () => {
    const itemsToHold = tickets
      .filter((t) => (selectedQuantities[t._id] || 0) > 0)
      .map((t) => ({
        id: t._id,
        name: t.name || t.type,
        price: t.price,
        quantity: selectedQuantities[t._id],
        subtotal: t.price * selectedQuantities[t._id],
      }));

    if (itemsToHold.length === 0) {
      showToast("Vui lòng chọn vé!", "warning");
      return;
    }

    try {
      // Gửi request hold lên server (giả định dùng item đầu tiên để lấy holdId đại diện)
      const response = await fetch(`${API_BASE_URL}/api/tickets/hold`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showtimeId: eventId,
          userId: currentUserId,
          ticketId: itemsToHold[0].id,
          quantity: itemsToHold[0].quantity,
        }),
      });
      const result = await response.json();

      if (result.status === "OK") {
        // TRUYỀN DỮ LIỆU CHI TIẾT SANG CHECKOUT
        navigate("/checkout", {
          state: {
            holdId: result.data.holdId,
            checkoutData: {
              items: itemsToHold,
              selectedQuantities,
              totalPrice: totalPrice,
              totalQuantity: totalQuantity,
              eventId: eventId,
              userId: currentUserId,
            },
          },
        });
      } else {
        showToast(result.message, "error");
      }
    } catch (err) {
      showToast("Lỗi hệ thống khi giữ vé", "error");
    }
  };

  if (loading && tickets.length === 0)
    return (
      <div style={styles.center}>
        <Loader2 className="spin" size={40} />
      </div>
    );

  return (
    <div style={styles.page}>
      {toast && (
        <div style={{ ...styles.toast, backgroundColor: COLORS[toast.type] }}>
          {toast.message}
        </div>
      )}

      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>Giao diện Đặt vé Sự kiện</h1>
          <p style={styles.subtitle}>Hệ thống Giữ chỗ theo thời gian thực</p>
        </header>

        <div style={styles.mainLayout}>
          <div style={styles.list}>
            {tickets.map((ticket) => (
              <div key={ticket._id} style={styles.card}>
                {/* Cột 1: Thông tin định danh & Giá */}
                <div style={styles.cardLeft}>
                  <div style={extendedStyles.ticketTypeBadge}>
                    {ticket.type}
                  </div>
                  <div style={styles.priceTag}>
                    {formatCurrency(ticket.price)}
                  </div>

                  <div style={extendedStyles.dateInfo}>
                    <Clock size={14} />
                    <span>
                      {ticket.startDate
                        ? new Date(ticket.startDate).toLocaleString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : "Sắp diễn ra"}
                    </span>
                  </div>

                  {ticket.zoneName && (
                    <div style={extendedStyles.zoneText}>
                      <Zap
                        size={14}
                        fill={COLORS.accent}
                        color={COLORS.accent}
                      />
                      {ticket.zoneName}
                    </div>
                  )}

                  <div style={styles.ticketTotal}>
                    {selectedQuantities[ticket._id] > 0
                      ? `Tạm tính: ${formatCurrency(
                          ticket.price * selectedQuantities[ticket._id]
                        )}`
                      : "Chưa chọn số lượng"}
                  </div>
                </div>

                {/* Cột 2: Nội dung mô tả (Đã xử lý HTML và cuộn) */}
                <div style={styles.cardCenter}>
                  <div style={styles.infoTitle}>Chi tiết & Quy định:</div>

                  <div style={extendedStyles.scrollDescription}>
                    {/* Render HTML từ database để nhận thẻ <p>, <br> */}
                    <div
                      style={extendedStyles.innerHtmlContent}
                      dangerouslySetInnerHTML={{ __html: ticket.description }}
                    />
                  </div>

                  <div style={extendedStyles.stockSummary}>
                    <span>
                      Tồn kho: <strong>{ticket.availability}</strong>
                    </span>
                    <span>
                      Đã giữ:{" "}
                      <strong style={{ color: COLORS.held }}>
                        {ticket.heldCount || 0}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Cột 3: Thao tác đặt vé */}
                <div style={styles.cardRight}>
                  <div style={styles.statusBox}>
                    <div
                      style={{
                        ...styles.statusText,
                        color:
                          ticket.availability > 0
                            ? COLORS.primary
                            : COLORS.error,
                      }}
                    >
                      {ticket.availability > 0 ? "ĐANG MỞ BÁN" : "HẾT VÉ"}
                    </div>
                    <div
                      style={{
                        ...styles.availabilityNum,
                        color:
                          ticket.availability > 0
                            ? COLORS.primary
                            : COLORS.error,
                      }}
                    >
                      {ticket.availability}
                    </div>
                  </div>

                  <div style={styles.qtyPicker}>
                    <button
                      onClick={() =>
                        updateQuantity(
                          ticket._id,
                          Math.max(0, (selectedQuantities[ticket._id] || 0) - 1)
                        )
                      }
                      style={styles.qtyBtn}
                    >
                      <Minus size={16} />
                    </button>
                    <span style={styles.qtyText}>
                      {selectedQuantities[ticket._id] || 0}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(
                          ticket._id,
                          Math.min(
                            ticket.availability,
                            (selectedQuantities[ticket._id] || 0) + 1
                          )
                        )
                      }
                      style={styles.qtyBtn}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.sidebar}>
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
    </div>
  );
};
const extendedStyles = {
  ticketTypeBadge: {
    display: "inline-block",
    padding: "2px 8px",
    backgroundColor: COLORS.secondary,
    color: "#fff",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: "bold",
    marginBottom: "8px",
    textTransform: "uppercase",
  },
  dateInfo: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    color: COLORS.textMuted,
    marginTop: "4px",
    marginBottom: "4px",
  },
  zoneText: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    fontWeight: "600",
    color: COLORS.accent,
    marginBottom: "10px",
  },
  descriptionBox: {
    marginTop: "12px",
    padding: "8px",
    backgroundColor: "#f8fafc",
    borderRadius: "6px",
    fontSize: "12px",
    color: COLORS.textMuted,
    borderLeft: `3px solid ${COLORS.border}`,
    display: "flex",
    gap: "6px",
  },

  scrollDescription: {
    marginTop: "8px",
    padding: "12px",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    fontSize: "13px",
    color: "#475569",
    border: `1px solid ${COLORS.border}`,
    maxHeight: "150px",
    overflowY: "auto",
    lineHeight: "1.6",
  },
  innerHtmlContent: {
    // Style cho các thẻ con bên trong HTML từ DB
    textAlign: "justify",
    wordBreak: "break-word",
  },
  stockSummary: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "12px",
    fontSize: "12px",
    padding: "0 5px",
  },
};
// --- STYLES (Inline CSS) ---
const styles = {
  page: {
    backgroundColor: COLORS.background,
    minHeight: "100vh",
    padding: "40px 20px",
    fontFamily: "sans-serif",
  },
  container: { maxWidth: "1200px", margin: "0 auto" },
  header: { textAlign: "center", marginBottom: "40px" },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    color: COLORS.secondary,
    marginBottom: "8px",
  },
  subtitle: { color: COLORS.textMuted, marginBottom: "20px" },
  metaInfo: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    fontSize: "12px",
    color: COLORS.textMuted,
    flexWrap: "wrap",
  },
  code: {
    backgroundColor: "#fff",
    padding: "2px 6px",
    borderRadius: "4px",
    border: `1px solid ${COLORS.border}`,
  },
  updateBadge: {
    display: "flex",
    alignItems: "center",
    color: COLORS.accent,
    fontWeight: "bold",
  },
  mainLayout: {
    display: "grid",
    gridTemplateColumns: "1fr 350px",
    gap: "30px",
  },
  list: { display: "flex", flexDirection: "column", gap: "20px" },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: "16px",
    padding: "24px",
    display: "grid",
    gridTemplateColumns: "220px 1fr 180px",
    gap: "20px",
    alignItems: "start",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)",
    border: `1px solid ${COLORS.border}`,
    marginBottom: "15px",
  },
  cardLeft: { borderRight: `1px solid ${COLORS.border}`, paddingRight: "20px" },
  priceTag: {
    fontSize: "24px",
    fontWeight: "900",
    color: COLORS.error,
    marginBottom: "8px",
  },
  ticketTotal: {
    fontSize: "14px",
    color: COLORS.primary,
    fontWeight: "600",
    marginTop: "5px",
  },
  cardCenter: { padding: "0 20px" },
  infoTitle: {
    fontWeight: "bold",
    fontSize: "14px",
    marginBottom: "10px",
    color: COLORS.secondary,
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    marginBottom: "4px",
  },
  cardRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "15px",
  },
  statusBox: { textAlign: "right" },
  statusText: { fontSize: "12px", fontWeight: "bold", letterSpacing: "1px" },
  availabilityNum: { fontSize: "32px", fontWeight: "900" },
  qtyPicker: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    border: `1px solid ${COLORS.border}`,
    overflow: "hidden",
  },
  qtyBtn: {
    border: "none",
    background: "white",
    padding: "8px 12px",
    cursor: "pointer",
  },
  qtyText: { padding: "0 15px", fontWeight: "bold", fontSize: "16px" },
  sidebar: { position: "sticky", top: "20px", height: "fit-content" },
  center: {
    display: "flex",
    height: "100vh",
    alignItems: "center",
    justifyContent: "center",
  },
  toast: {
    position: "fixed",
    top: "20px",
    right: "20px",
    padding: "12px 24px",
    color: "white",
    borderRadius: "8px",
    zIndex: 1000,
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    fontWeight: "bold",
  },
};

export default TicketBookingPage;

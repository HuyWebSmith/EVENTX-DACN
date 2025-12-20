import React, { useState } from "react";
import { Space, Button, Typography, Tag, Divider } from "antd";
import {
  DownOutlined,
  UpOutlined,
  UnorderedListOutlined,
  CalendarOutlined,
  ShoppingCartOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
dayjs.extend(isSameOrBefore);

const { Text } = Typography;

// --- Styles (Giữ nguyên) ---
const wrapperStyle = {
  background: "#282c34",
  borderRadius: "10px",
  color: "#e0e0e0",
  padding: "20px 25px",
  marginBottom: "25px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "15px",
  borderBottom: "1px solid #444",
  paddingBottom: "15px",
};

const scheduleItemStyle = (isHighlighted, isExpanded) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 10px",
  borderBottom: "1px solid #3a3a3a",
  background: isHighlighted
    ? "#3a3f47"
    : isExpanded
    ? "#3a3f47"
    : "transparent",
  cursor: "pointer",
  transition: "background 0.2s ease-in-out",
  borderRadius: isExpanded ? "4px 4px 0 0" : "4px",
  marginBottom: isExpanded ? "0" : "5px",
  "&:hover": {
    background: "#3a3f47",
  },
});

// --- Component hiển thị chi tiết vé (Giữ nguyên) ---
const TicketDetailList = ({ tickets, eventId, currentUser }) => {
  const sortedTickets = tickets.sort((a, b) => a.price - b.price);
  const navigate = useNavigate();

  const handleSelectTicket = (ticket) => {
    if (ticket.trangThai === "ConVe" || ticket.trangThai === "SapBan") {
      if (!currentUser) {
        // Nếu chưa đăng nhập
        navigate("/sign-in", { state: { from: `/event/${eventId}/book` } });
        return;
      }
      // Chỉ cho phép mua khi còn vé hoặc sắp hết
      navigate(`/event/${eventId}/book`, {
        state: { selectedTicketId: ticket._id },
      });
    }
  };

  const renderTicketButton = (ticket) => {
    switch (ticket.trangThai) {
      case "ConVe":
        return (
          <Button
            size="middle"
            icon={<ShoppingCartOutlined />}
            style={{
              marginLeft: "15px",
              background: "#34d399",
              borderColor: "#34d399",
              color: "#fff",
              fontWeight: "bold",
              borderRadius: "5px",
            }}
            onClick={() => handleSelectTicket(ticket)}
          >
            Chọn vé
          </Button>
        );
      case "SapBan":
        return (
          <Button
            size="middle"
            icon={<ShoppingCartOutlined />}
            style={{
              marginLeft: "15px",
              background: "#faad14",
              borderColor: "#faad14",
              color: "#fff",
              fontWeight: "bold",
              borderRadius: "5px",
            }}
            onClick={() => handleSelectTicket(ticket)}
          >
            Sắp hết vé
          </Button>
        );
      case "HetVe":
        return (
          <Button
            size="middle"
            disabled
            style={{
              marginLeft: "15px",
              background: "#ff4d4f",
              borderColor: "#ff4d4f",
              color: "#fff",
              fontWeight: "bold",
              borderRadius: "5px",
              cursor: "not-allowed",
            }}
          >
            🚫 HẾT VÉ
          </Button>
        );
      case "HetHan":
        return (
          <Button
            size="middle"
            disabled
            style={{
              marginLeft: "15px",
              background: "#d9d9d9",
              borderColor: "#d9d9d9",
              color: "#000",
              fontWeight: "bold",
              borderRadius: "5px",
              cursor: "not-allowed",
            }}
          >
            ĐÃ HẾT HẠN
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        padding: "15px 20px",
        background: "#3a3f47",
        borderBottom: "1px solid #444",
        borderRadius: "0 0 10px 10px",
        marginBottom: "5px",
      }}
    >
      <Text
        strong
        style={{
          color: "#fff",
          fontSize: "16px",
          marginBottom: "10px",
          display: "block",
        }}
      >
        Các loại vé có sẵn:
      </Text>
      <Divider style={{ margin: "10px 0", borderColor: "#555" }} />
      {sortedTickets.length > 0 ? (
        sortedTickets.map((ticket) => (
          <div
            key={ticket._id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 0",
              borderBottom: "1px dashed #555",
            }}
          >
            <div style={{ flexGrow: 1 }}>
              <Text
                style={{ color: "#fff", fontWeight: "bold", fontSize: "15px" }}
              >
                {ticket.type}
              </Text>
              <Tag
                color={
                  ticket.trangThai === "SapBan"
                    ? "orange"
                    : ticket.trangThai === "HetVe"
                    ? "red"
                    : "green"
                }
                style={{ marginLeft: "12px", borderRadius: "4px" }}
              >
                {ticket.trangThai === "ConVe" || ticket.trangThai === "SapBan"
                  ? `Còn: ${ticket.quantity - ticket.sold}`
                  : ticket.trangThai === "HetVe"
                  ? "Hết vé"
                  : "Đã hết hạn"}
              </Tag>
              <p
                style={{
                  color: "#b0b0b0",
                  fontSize: "13px",
                  margin: "5px 0 0 0",
                }}
              >
                {ticket.description
                  ? ticket.description.replace(/<[^>]+>/g, "")
                  : "Không có mô tả chi tiết."}
              </p>
            </div>

            <div style={{ textAlign: "right", minWidth: "160px" }}>
              <Text
                style={{
                  color: "#34d399",
                  fontWeight: "bold",
                  fontSize: "20px",
                }}
              >
                {ticket.price.toLocaleString("vi-VN")} ₫
              </Text>
              {renderTicketButton(ticket)}
            </div>
          </div>
        ))
      ) : (
        <p style={{ color: "#b0b0b0", textAlign: "center", padding: "10px" }}>
          Không có loại vé nào cho lịch diễn này.
        </p>
      )}
    </div>
  );
};

// --- Component con Lịch diễn (Giữ nguyên) ---
const ScheduleItem = ({
  dayOfWeek,
  date,
  timeRange,
  onToggle,
  isExpanded,
  relatedTickets,
}) => {
  const isToday = dayjs(date).isSame(dayjs(), "day");
  const Icon = isExpanded ? UpOutlined : DownOutlined;

  // Xác định trạng thái chung của nút Mua vé ngay
  let buttonState = { text: "Mua vé ngay", disabled: false, color: "#34d399" };

  if (relatedTickets.every((t) => t.trangThai === "HetVe")) {
    buttonState = { text: "🚫 HẾT VÉ", disabled: true, color: "#ff4d4f" };
  } else if (relatedTickets.every((t) => t.trangThai === "HetHan")) {
    buttonState = {
      text: "ĐÃ HẾT HẠN",
      disabled: true,
      color: "#d9d9d9",
      textColor: "#000",
    };
  } else if (relatedTickets.some((t) => t.trangThai === "SapBan")) {
    buttonState = { text: "Sắp hết vé", disabled: false, color: "#faad14" };
  }

  return (
    <div
      style={scheduleItemStyle(isToday, isExpanded)}
      onClick={onToggle}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#3a3f47")}
      onMouseLeave={(e) =>
        (e.currentTarget.style.background =
          isToday || isExpanded ? "#3a3f47" : "transparent")
      }
    >
      <div style={{ paddingLeft: "10px" }}>
        <Icon
          style={{ marginRight: "12px", color: "#00cc66", fontSize: "15px" }}
        />
        <Text style={{ fontSize: "17px", color: "#e0e0e0", fontWeight: "500" }}>
          {timeRange}, {dayOfWeek}
        </Text>
        <br />
        <Text
          style={{ fontSize: "14px", marginLeft: "27px", color: "#a0a0a0" }}
        >
          {dayjs(date).format("DD [Tháng] MM, YYYY")}
        </Text>
      </div>
      {!isExpanded && (
        <Button
          type="primary"
          disabled={buttonState.disabled}
          style={{
            background: buttonState.color,
            borderColor: buttonState.color,
            color: buttonState.textColor || "#fff",
            fontWeight: "bold",
            borderRadius: "5px",
            padding: "0 18px",
            height: "38px",
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (!buttonState.disabled) onToggle(); // hoặc gọi navigate đến book page
          }}
        >
          {buttonState.text}
        </Button>
      )}
    </div>
  );
};

// --- Hàm xử lý dữ liệu TICKET (Giữ nguyên) ---
const groupTicketsToSchedule = (tickets) => {
  if (!tickets || tickets.length === 0) return [];
  const scheduleMap = new Map();

  tickets.forEach((ticket) => {
    const start = dayjs(ticket.startDate);
    const end = dayjs(ticket.endDate);

    const dateKey = start.format("YYYY-MM-DD");
    const timeRangeKey = `${start.format("HH:mm")} - ${end.format("HH:mm")}`;
    const uniqueKey = `${dateKey}|${timeRangeKey}`;

    const dayOfWeek = start.format("dddd");
    const dayOfWeekVN = {
      Monday: "T2",
      Tuesday: "T3",
      Wednesday: "T4",
      Thursday: "T5",
      Friday: "T6",
      Saturday: "T7",
      Sunday: "CN",
    }[dayOfWeek];

    if (!scheduleMap.has(uniqueKey)) {
      scheduleMap.set(uniqueKey, {
        id: uniqueKey,
        date: start.toDate(),
        dayOfWeek: dayOfWeekVN,
        timeRange: timeRangeKey,
        relatedTickets: [ticket],
      });
    } else {
      scheduleMap.get(uniqueKey).relatedTickets.push(ticket);
    }
  });

  return Array.from(scheduleMap.values()).sort(
    (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf()
  );
};

// --- HÀM HỖ TRỢ TẠO LƯỚI LỊCH TỪ DỮ LIỆU VÉ THẬT ---
const generateCalendarGrid = (tickets, targetMonth, scheduleMap) => {
  const startOfMonth = targetMonth.startOf("month");
  const daysInMonth = targetMonth.daysInMonth();

  // Ngày trong tuần đầu tiên của tháng (0: CN, 1: T2, ...)
  const firstDayOfWeek = startOfMonth.day();
  // Vị trí bắt đầu của ngày 1 (0 là T2)
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  let grid = [];

  // Điền các ngày trống đầu tháng
  for (let i = 0; i < startOffset; i++) {
    grid.push(null);
  }

  // Điền các ngày trong tháng
  for (let i = 1; i <= daysInMonth; i++) {
    const currentDate = startOfMonth.date(i);
    const dateKey = currentDate.format("YYYY-MM-DD");

    // Đếm suất diễn dựa trên scheduleMap đã tính toán
    const sessions = scheduleMap.filter(
      (item) => dayjs(item.date).format("YYYY-MM-DD") === dateKey
    );
    const sessionsCount = sessions.reduce(
      (sum, item) => sum + item.relatedTickets.length,
      0
    );

    grid.push({
      date: i,
      sessionsCount: sessionsCount,
      hasSessions: sessionsCount > 0,
      // Giả lập ngày đang được chọn là ngày 1
      isSelected: i === 1,
    });
  }

  // Điền các ô trống cuối tháng
  while (grid.length % 7 !== 0 || grid.length < 35) {
    grid.push(null);
  }

  return grid;
};
// ------------------------------------------------

// --- COMPONENT LỊCH THẬT (CustomCalendarView) ---
const CustomCalendarView = ({ scheduleData, tickets }) => {
  // State để quản lý tháng hiển thị (Khởi tạo là tháng đầu tiên của lịch diễn)
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (scheduleData.length > 0) {
      return dayjs(scheduleData[0].date).startOf("month");
    }
    return dayjs().startOf("month");
  });

  const daysOfWeek = [
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
    "Chủ nhật",
  ];

  // Lấy lưới lịch dựa trên dữ liệu vé thực tế
  const calendarGrid = generateCalendarGrid(
    tickets,
    currentMonth,
    scheduleData
  );

  // Tổng số suất diễn trong tháng (tính từ scheduleData)
  const totalSessionsInMonth = scheduleData.filter((item) =>
    dayjs(item.date).isSame(currentMonth, "month")
  ).length;

  // Logic điều hướng tháng
  const navigateMonth = (direction) => {
    setCurrentMonth((prev) => prev.add(direction, "month"));
  };

  // Style cho ô ngày
  const dayBoxStyle = (day) => ({
    width: "100%",
    padding: "10px 5px",
    textAlign: "center",
    borderRadius: "5px",
    cursor: day && day.hasSessions ? "pointer" : "default",
    background:
      day && day.hasSessions ? "transparent" : day ? "#333" : "transparent",
    border: day && day.isSelected ? "2px solid #34d399" : "none",
    color: day ? "#fff" : "#888",
    fontSize: "18px",
    fontWeight: "bold",
    margin: "2px 0",
    transition: "background 0.1s",
    "&:hover": {
      background: day && day.hasSessions ? "#3a3f47" : "transparent",
    },
  });

  return (
    <div style={{ maxHeight: "400px", overflowY: "auto", paddingRight: "5px" }}>
      {/* Thanh điều hướng tháng */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "15px",
          borderBottom: "1px solid #3a3a3a",
          paddingBottom: "10px",
        }}
      >
        <LeftOutlined
          style={{ color: "#e0e0e0", cursor: "pointer" }}
          onClick={() => navigateMonth(-1)}
        />

        <div style={{ flexGrow: 1, textAlign: "left", marginLeft: "10px" }}>
          <Text
            strong
            style={{ color: "#34d399", fontSize: "18px", display: "block" }}
          >
            {currentMonth.format("[Tháng] MM, YYYY")}
          </Text>
          <Text style={{ color: "#a0a0a0", fontSize: "14px" }}>
            {totalSessionsInMonth} suất diễn
          </Text>
        </div>

        {/* Thanh tháng lân cận */}
        <Space size={30} style={{ marginRight: "20px" }}>
          {[0, 1, 2, 3].map((offset) => {
            const target = currentMonth.add(offset, "month");
            const monthName = target
              .format("MMM")
              .replace("Dec", "Th 12")
              .replace("Jan", "Th 1")
              .replace("Feb", "Th 2")
              .replace("Mar", "Th 3")
              .replace("Apr", "Th 4");
            const isCurrent = offset === 0;
            const sessionsCount = isCurrent ? totalSessionsInMonth : 0; // Tạm thời chỉ hiển thị count cho tháng hiện tại

            return (
              <div key={offset} style={{ textAlign: "center" }}>
                <Text
                  strong
                  style={{
                    color: isCurrent ? "#34d399" : "#e0e0e0",
                    display: "block",
                    marginBottom: "3px",
                  }}
                >
                  {monthName}
                </Text>
                <Text style={{ color: "#a0a0a0", fontSize: "12px" }}>
                  {sessionsCount} suất diễn
                </Text>
              </div>
            );
          })}
        </Space>

        <RightOutlined
          style={{ color: "#e0e0e0", cursor: "pointer" }}
          onClick={() => navigateMonth(1)}
        />
      </div>

      {/* Thanh Tên Thứ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          marginBottom: "10px",
        }}
      >
        {daysOfWeek.map((day) => (
          <div
            key={day}
            style={{
              textAlign: "center",
              color: "#a0a0a0",
              fontSize: "14px",
              padding: "5px 0",
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Lưới Ngày */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "5px",
        }}
      >
        {calendarGrid.map((day, index) => (
          <div key={index} style={dayBoxStyle(day)}>
            {day ? (
              <>
                <div
                  style={{
                    lineHeight: "28px",
                    borderBottom:
                      day.isSelected || day.hasSessions
                        ? "2px solid #34d399"
                        : "none",
                    color: day.hasSessions ? "#e0e0e0" : "#888",
                  }}
                >
                  {day.date}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: day.sessionsCount > 0 ? "#34d399" : "#888",
                    marginTop: "2px",
                  }}
                >
                  {day.sessionsCount > 0 ? `${day.sessionsCount} suất` : ""}
                </div>
              </>
            ) : (
              <div style={{ height: "50px" }}></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Component chính ---
const EventScheduleComponent = ({ tickets, eventId }) => {
  const [viewMode, setViewMode] = useState("list");
  const [expandedScheduleId, setExpandedScheduleId] = useState(null);

  const scheduleData = groupTicketsToSchedule(tickets);
  const navigate = useNavigate();
  const handleBuyClick = () => {
    if (eventId) {
      navigate(`/event/${eventId}/book`);
    } else {
      console.error("Thiếu eventId để điều hướng!");
    }
  };
  const currentUser = useSelector((state) => state.user);
  const handleToggle = (id) => {
    setExpandedScheduleId((prevId) => (prevId === id ? null : id));
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setExpandedScheduleId(null);
  };

  return (
    <div style={wrapperStyle}>
      <div style={headerStyle}>
        <h3 style={{ color: "#e0e0e0", margin: 0, fontSize: "20px" }}>
          Lịch diễn
        </h3>
        <Space>
          <Button
            style={{
              background: viewMode === "list" ? "#34d399" : "#444",
              borderColor: viewMode === "list" ? "#34d399" : "#444",
              color: "#fff",
              borderRadius: "5px",
            }}
            icon={<UnorderedListOutlined />}
            onClick={() => handleViewModeChange("list")}
          />
          <Button
            style={{
              background: viewMode === "calendar" ? "#34d399" : "#444",
              borderColor: viewMode === "calendar" ? "#34d399" : "#444",
              color: "#fff",
              borderRadius: "5px",
            }}
            icon={<CalendarOutlined />}
            onClick={() => handleViewModeChange("calendar")}
          />
        </Space>
      </div>

      {viewMode === "list" ? (
        <div
          style={{ maxHeight: "350px", overflowY: "auto", paddingRight: "5px" }}
        >
          {scheduleData.length > 0 ? (
            scheduleData.map((item) => {
              const isExpanded = expandedScheduleId === item.id;
              return (
                <React.Fragment key={item.id}>
                  <ScheduleItem
                    dayOfWeek={item.dayOfWeek}
                    date={item.date}
                    timeRange={item.timeRange}
                    onBuyClick={handleBuyClick}
                    onToggle={() => handleToggle(item.id)}
                    isExpanded={isExpanded}
                    relatedTickets={item.relatedTickets}
                  />
                  {isExpanded && (
                    <TicketDetailList
                      tickets={item.relatedTickets}
                      eventId={eventId}
                      currentUser={currentUser}
                    />
                  )}
                </React.Fragment>
              );
            })
          ) : (
            <p
              style={{
                color: "#b0b0b0",
                textAlign: "center",
                padding: "15px",
                fontSize: "15px",
              }}
            >
              Không tìm thấy lịch diễn cụ thể cho sự kiện này.
            </p>
          )}
        </div>
      ) : (
        <CustomCalendarView scheduleData={scheduleData} tickets={tickets} />
      )}
    </div>
  );
};

export default EventScheduleComponent;

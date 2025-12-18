import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Card, message, Tag, Modal } from "antd";
import beepSound from "../../../src/assets/mp3/beep.mp3";
import dayjs from "dayjs";
const CheckInPage = () => {
  const [result, setResult] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const qrRef = useRef(null);
  const scanner = useRef(null);

  // cờ để chặn scan liên tục cùng 1 QR code
  const isProcessing = useRef(false);

  useEffect(() => {
    if (!qrRef.current) return;

    scanner.current = new Html5Qrcode("qr-reader");

    scanner.current
      .start({ facingMode: "environment" }, { fps: 10, qrbox: 250 }, handleScan)
      .catch(() => message.error("Không thể khởi động camera"));

    return () => {
      if (scanner.current)
        scanner.current.stop().then(() => scanner.current.clear());
    };
  }, []);

  const handleScan = async (qrCode) => {
    if (isProcessing.current) return;
    isProcessing.current = true;

    new Audio(beepSound).play();

    try {
      const response = await fetch("/api/checkin-order/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketCode: qrCode }),
      });

      const resultFromServer = await response.json();

      // Lưu resultFromServer.data thay vì resultFromServer
      setResult(resultFromServer);
      setModalOpen(true);

      if (resultFromServer.success) {
        message.success("✔ Check-in thành công");
      } else {
        message.error(resultFromServer.message || "Thất bại");
      }
    } catch (e) {
      message.error("Lỗi server hoặc kết nối");
      isProcessing.current = false;
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <Card
        title="🎫 Quét mã Check-in"
        style={{ maxWidth: 600, margin: "auto" }}
      >
        <div id="qr-reader" ref={qrRef} style={{ width: "100%" }}></div>
      </Card>

      <Modal
        title={
          result?.success ? "✔ Check-in thành công" : "❌ Check-in thất bại"
        }
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          isProcessing.current = false;
        }}
        footer={null}
        width={500}
      >
        {result?.data ? (
          <div style={{ padding: "10px 0" }}>
            <Tag
              color="green"
              style={{
                fontSize: 14,
                marginBottom: 15,
                width: "100%",
                textAlign: "center",
                padding: 5,
              }}
            >
              {result.message}
            </Tag>

            <h3 style={{ borderBottom: "1px solid #eee", paddingBottom: 5 }}>
              📌 Chi tiết vé
            </h3>
            <p>
              <b>Mã vé:</b> <Tag color="blue">{result.data.ticketCode}</Tag>
            </p>

            {/* Thông tin từ ticketId lồng bên trong */}
            <p>
              <b>Loại vé:</b> {result.data.orderDetailId?.ticketId?.type}
            </p>
            <p>
              <b>Giá vé:</b>{" "}
              {result.data.orderDetailId?.ticketId?.price?.toLocaleString()} VND
            </p>

            <h3
              style={{
                borderBottom: "1px solid #eee",
                paddingBottom: 5,
                marginTop: 20,
              }}
            >
              👤 Trạng thái
            </h3>
            <p>
              <b>Check-in:</b>
              {result.data.status === "CheckedIn" ? (
                <Tag color="cyan">ĐÃ XÁC NHẬN</Tag>
              ) : (
                <Tag color="orange">CHƯA XÁC NHẬN</Tag>
              )}
            </p>
            <p>
              <b>Thời gian quét:</b>{" "}
              {dayjs(result.data.checkinTime).format("HH:mm:ss DD/MM/YYYY")}
            </p>

            <div
              style={{
                marginTop: 15,
                padding: 10,
                background: "#fffbe6",
                border: "1px solid #ffe58f",
                borderRadius: 8,
              }}
            >
              <small>
                <b>Lưu ý:</b>{" "}
                {result.data.orderDetailId?.ticketId?.description
                  ?.replace(/<[^>]*>?/gm, "")
                  .slice(0, 100)}
                ...
              </small>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: 20 }}>
            <p>Không tìm thấy dữ liệu chi tiết cho mã vé này.</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CheckInPage;

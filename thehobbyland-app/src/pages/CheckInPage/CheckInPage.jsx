import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Card, message, Tag, Modal } from "antd";
import beepSound from "../../../src/assets/mp3/beep.mp3";

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
    if (isProcessing.current) return; // nếu đang xử lý → ignore
    isProcessing.current = true;

    // phát âm thanh quét
    new Audio(beepSound).play();

    try {
      const res = await fetch("/api/orders/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketCode: qrCode }),
      });

      const data = await res.json();
      setResult(data);
      setModalOpen(true);

      if (data.success) message.success("✔ Check-in thành công");
      else message.error(data.message || "Check-in thất bại");
    } catch (e) {
      message.error("Lỗi server");
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
          isProcessing.current = false; // reset cờ để scan tiếp
        }}
        footer={false}
      >
        <Tag
          color={result?.success ? "green" : "red"}
          style={{ fontSize: 15, marginBottom: 10 }}
        >
          {result?.message}
        </Tag>

        {result?.ticket ? (
          <>
            <h3>📌 Thông tin vé</h3>
            <p>
              <b>Mã vé:</b> {result.ticket.ticketCode}
            </p>
            <p>
              <b>Người mua:</b> {result.ticket.buyerName}
            </p>
            <p>
              <b>Email:</b> {result.ticket.buyerEmail}
            </p>
            <p>
              <b>Trạng thái:</b>
              {result.ticket.isCheckedIn ? (
                <Tag color="blue">ĐÃ CHECK-IN</Tag>
              ) : (
                <Tag color="orange">CHƯA CHECK-IN</Tag>
              )}
            </p>

            {result.ticket.checkedInAt && (
              <p>
                <b>Thời gian check-in:</b> {result.ticket.checkedInAt}
              </p>
            )}

            {result.ticket.event && (
              <>
                <h3 style={{ marginTop: 15 }}>🎉 Sự kiện</h3>
                <p>
                  <b>Tên sự kiện:</b> {result.ticket.event.name}
                </p>
                <p>
                  <b>Thời gian:</b> {result.ticket.event.startDate}
                </p>
                <p>
                  <b>Địa điểm:</b> {result.ticket.event.location}
                </p>
              </>
            )}
          </>
        ) : (
          <p style={{ marginTop: 10 }}>Không có dữ liệu vé.</p>
        )}
      </Modal>
    </div>
  );
};

export default CheckInPage;

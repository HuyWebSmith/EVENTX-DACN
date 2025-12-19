import React from "react";
import { LockOutlined, CrownOutlined } from "@ant-design/icons";
import { Progress, Tooltip } from "antd";

const statusConfig = {
  Locked: {
    label: "Locked",
    color: "#888",
    icon: <LockOutlined />,
    tooltip: "Hoàn thành nhiệm vụ để mở ví",
    progress: 0,
  },
  Basic: {
    label: "Basic",
    color: "#FFA500",
    icon: "🟡",
    tooltip: "Email + Profile: Chỉ Nạp tiền, xem số dư, chưa rút được",
    progress: 25,
  },
  Active: {
    label: "Active",
    color: "#2ECC71",
    icon: "🟢",
    tooltip: "Có giao dịch: Thanh toán sự kiện, chuyển nội bộ (không rút)",
    progress: 50,
  },
  Verified: {
    label: "Verified",
    color: "#3498DB",
    icon: "🔵",
    tooltip: "KYC: Rút tiền, thanh toán, nạp tiền",
    progress: 75,
  },
  Trusted: {
    label: "Trusted",
    color: "#8E44AD",
    icon: <CrownOutlined />,
    tooltip: "Lịch sử tốt: Rút nhanh, hạn mức cao, ưu tiên hỗ trợ",
    progress: 100,
  },
};

const WalletStatus = ({ status }) => {
  const config = statusConfig[status];
  if (!config) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "10px",
      }}
    >
      <Tooltip title={config.tooltip}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 12px",
            borderRadius: "12px",
            backgroundColor: "#f0f0f0",
            color: config.color,
            fontWeight: 600,
            fontSize: "14px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          }}
        >
          {config.icon}
          <span>{config.label}</span>
        </div>
      </Tooltip>
      <Progress
        percent={config.progress}
        size="small"
        strokeColor={config.color}
        style={{ width: "120px", marginTop: "6px" }}
      />
    </div>
  );
};

export default WalletStatus;

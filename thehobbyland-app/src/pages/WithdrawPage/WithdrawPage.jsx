import React, { useState } from "react";
import {
  Card,
  InputNumber,
  Input,
  Button,
  Typography,
  Modal,
  notification,
} from "antd";
import { useSelector, useDispatch } from "react-redux";
import { WalletOutlined, LockOutlined } from "@ant-design/icons";
import { updateWalletBalance } from "../../redux/slides/userSlide";
import { axiosJWT } from "../../services/UserService"; // axios đã có JWT

const { Title, Text } = Typography;

const WithdrawPage = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [amount, setAmount] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const canWithdraw = ["Verified", "Trusted"].includes(user.walletStatus);
  console.log("walletStatus:", user.walletStatus);

  const handleOpenModal = () => {
    if (!amount || amount <= 0) {
      api.error({ message: "Vui lòng nhập số tiền hợp lệ" });
      return;
    }
    if (amount > user.walletBalance) {
      api.error({ message: "Số dư không đủ" });
      return;
    }
    setIsModalOpen(true);
  };

  const handleConfirmWithdraw = async () => {
    if (!password) {
      api.error({ message: "Vui lòng nhập mật khẩu" });
      return;
    }

    try {
      setIsProcessing(true);

      const res = await axiosJWT.post("http://localhost:3000/wallet/deduct", {
        amount,
        password,
      });

      if (res.data.success) {
        dispatch(updateWalletBalance(res.data.newBalance));
        api.success({
          message: "Rút tiền thành công",
          description: `Đã gửi yêu cầu rút ${amount.toLocaleString()} đ`,
        });
        setIsModalOpen(false);
        setAmount(null);
        setPassword("");
      }
    } catch (err) {
      api.error({
        message: "Rút tiền thất bại",
        description: err.response?.data?.message || "Lỗi hệ thống",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      {contextHolder}
      <Card
        title={
          <Title level={3} style={{ textAlign: "center", margin: 0 }}>
            <WalletOutlined style={{ marginRight: 10, color: "#ff4d4f" }} />
            Rút tiền qua PayPal
          </Title>
        }
        style={{ width: 460, borderRadius: 14 }}
      >
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <Text type="secondary">Số dư ví</Text>
          <Title level={2} style={{ color: "#ff4d4f" }}>
            {user.walletBalance?.toLocaleString()} đ
          </Title>
        </div>

        <InputNumber
          value={amount}
          onChange={setAmount}
          min={1000}
          max={user.walletBalance}
          style={{ width: "100%", marginBottom: 20, height: 50, fontSize: 18 }}
          placeholder="Nhập số tiền muốn rút"
        />

        <Button
          type="primary"
          block
          size="large"
          onClick={handleOpenModal}
          disabled={
            !canWithdraw ||
            !amount ||
            amount <= 0 ||
            amount > user.walletBalance
          }
        >
          Yêu cầu rút tiền
        </Button>
        {!canWithdraw && (
          <Text type="danger" style={{ display: "block", marginTop: 10 }}>
            <LockOutlined /> Ví chưa xác minh (KYC). Hoàn thành xác minh để được
            rút tiền.
          </Text>
        )}

        <Text type="secondary" style={{ display: "block", marginTop: 10 }}>
          Tỷ giá ước tính: 1 USD ≈ 25.000 VND
        </Text>
      </Card>

      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <LockOutlined />
            Xác nhận mật khẩu
          </div>
        }
        open={isModalOpen}
        onOk={handleConfirmWithdraw}
        confirmLoading={isProcessing}
        onCancel={() => setIsModalOpen(false)}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <p>
          Nhập mật khẩu của bạn để xác nhận rút {amount?.toLocaleString()} đ
        </p>
        <Input.Password
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default WithdrawPage;

import React, { useState } from "react";
import { Card, InputNumber, Button, message, Typography, Divider } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { deductBalance } from "../../services/WalletService";
import { updateWalletBalance } from "../../redux/slides/userSlide";
import { WalletOutlined, ArrowDownOutlined } from "@ant-design/icons";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const { Title, Text } = Typography;

const WithdrawPayPalPage = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [amount, setAmount] = useState(null);
  const [loading, setLoading] = useState(false);

  // Gọi API backend để tạo payout
  const handleWithdraw = async () => {
    if (!amount || amount <= 0) {
      message.error("Vui lòng nhập số tiền hợp lệ");
      return;
    }
    if (amount > user.walletBalance) {
      message.error("Số dư không đủ");
      return;
    }
    setLoading(true);
    try {
      // Backend sẽ trả về link PayPal Payout hoặc xác nhận thanh toán
      const res = await deductBalance(user.id, amount);
      dispatch(updateWalletBalance(res.balance));
      message.success(`Đã trừ ${amount.toLocaleString()}đ khỏi ví. `);
    } catch (err) {
      message.error(err.response?.data?.message || "Rút tiền thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "40px 20px",
        display: "flex",
        justifyContent: "center",
        background: "#f6f8fc",
        minHeight: "100vh",
      }}
    >
      <Card
        hoverable
        title={
          <Title level={3} style={{ margin: 0, textAlign: "center" }}>
            <WalletOutlined style={{ marginRight: 10, color: "#ff4d4f" }} />
            Rút tiền qua PayPal
          </Title>
        }
        style={{ width: 460, maxWidth: "95%", borderRadius: 14 }}
        bodyStyle={{ padding: 30 }}
      >
        {/* Balance */}
        <div style={{ marginBottom: 28, textAlign: "center" }}>
          <Text type="secondary">Số dư ví</Text>
          <Title level={1} style={{ margin: 0, color: "#ff4d4f" }}>
            {user.walletBalance?.toLocaleString()} đ
          </Title>
        </div>

        {/* Input tiền muốn rút */}
        <div style={{ marginBottom: 28 }}>
          <Text strong>Nhập số tiền muốn rút</Text>
          <InputNumber
            value={amount}
            onChange={setAmount}
            min={1000}
            max={user.walletBalance}
            style={{
              width: "100%",
              height: 50,
              borderRadius: 10,
              fontSize: 18,
            }}
          />
        </div>

        {/* Button trừ tiền */}
        <Button
          type="primary"
          block
          size="large"
          onClick={handleWithdraw}
          loading={loading}
          disabled={!amount || amount <= 0 || amount > user.walletBalance}
        >
          Rút tiền
        </Button>

        {/* PayPal Payout (tùy backend hỗ trợ) */}

        <Text type="secondary" style={{ display: "block", marginTop: 10 }}>
          Tỷ giá ước tính: 1 USD ≈ 25.000 VND
        </Text>
      </Card>
    </div>
  );
};

export default WithdrawPayPalPage;

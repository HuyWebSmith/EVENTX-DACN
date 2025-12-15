import React, { useState } from "react";
import { Card, InputNumber, Button, message, Typography, Divider } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { addBalance } from "../../services/WalletService";
import { updateWalletBalance } from "../../redux/slides/userSlide";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { WalletOutlined, ArrowUpOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const WalletPage = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [amount, setAmount] = useState(null);

  const handleRechargeSuccess = async () => {
    try {
      const res = await addBalance(user.id, amount);

      if (res.data.success) {
        message.success(
          `Nạp thành công! Số dư mới: ${res.data.balance.toLocaleString()}đ`
        );

        dispatch(updateWalletBalance(res.data.balance));
        setAmount(null);
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      message.error("Không thể nạp tiền");
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
            <WalletOutlined style={{ marginRight: 10, color: "#1677ff" }} />
            Ví EVENTX
          </Title>
        }
        headStyle={{
          background: "#ffffff",
          borderBottom: "1px solid #f0f0f0",
        }}
        style={{
          width: 460,
          maxWidth: "95%",
          borderRadius: 14,
          border: "1px solid #e7e9ef",
          boxShadow: "0 6px 18px rgba(0, 0, 0, 0.05)",
        }}
        bodyStyle={{ padding: 30 }}
      >
        {/* Balance Card */}
        <div
          style={{
            background: "#ffffff",
            padding: "18px 20px",
            borderRadius: 14,
            border: "1px solid #e7e9ef",
            marginBottom: 28,
            textAlign: "center",
          }}
        >
          <Text type="secondary" style={{ fontSize: 15 }}>
            Số dư ví
          </Text>
          <Title
            level={1}
            style={{
              margin: "4px 0 0",
              fontSize: 42,
              color: "#1677ff",
            }}
          >
            {user.walletBalance?.toLocaleString()} đ
          </Title>
        </div>

        {/* Divider */}
        <Divider plain style={{ margin: "0 0 24px", color: "#555" }}>
          <ArrowUpOutlined style={{ color: "#1677ff" }} /> Nạp tiền
        </Divider>

        {/* Input money */}
        <div style={{ marginBottom: 28 }}>
          <Text
            strong
            style={{ fontSize: 15, marginBottom: 12, display: "block" }}
          >
            Nhập số tiền muốn nạp
          </Text>

          <InputNumber
            placeholder="Ví dụ: 200.000"
            value={amount}
            onChange={(v) => setAmount(v)}
            min={1000}
            style={{
              width: "100%",
              height: 50,
              borderRadius: 10,
              fontSize: 18,
              paddingRight: 45,
            }}
          />
          <div
            style={{
              position: "absolute",
              right: 15,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 18,
              color: "#555",
            }}
          >
            đ
          </div>
        </div>

        {/* PayPal */}
        <PayPalScriptProvider
          options={{
            "client-id":
              "AbEmAsz_VTEaZy89MnNUgeH_NERJoWZmP_zhLQhFOvTa9nRtMf53AcxZEszYEIobMWPFA66LxN_ijotm",
            currency: "USD",
          }}
        >
          <div
            style={{
              padding: "16px",
              borderRadius: 12,
              background: "#fafbfd",
              border: "1px solid #e5e8ef",
            }}
          >
            <Text
              strong
              style={{
                display: "block",
                marginBottom: 14,
                textAlign: "center",
                fontSize: 14,
              }}
            >
              Thanh toán qua PayPal
            </Text>

            <PayPalButtons
              style={{
                layout: "vertical",
                color: "blue",
                shape: "rect",
                height: 42,
              }}
              disabled={!amount || amount < 1000}
              createOrder={(data, actions) => {
                return actions.order.create({
                  purchase_units: [
                    {
                      amount: {
                        value: (amount / 25000).toFixed(2),
                      },
                    },
                  ],
                });
              }}
              onApprove={(data, actions) => {
                return actions.order.capture().then(async (details) => {
                  message.success(
                    `PayPal: ${details.payer.name.given_name} thanh toán thành công!`
                  );
                  await handleRechargeSuccess();
                });
              }}
              onError={() => {
                message.error("Thanh toán PayPal thất bại. Vui lòng thử lại.");
              }}
            />
          </div>
        </PayPalScriptProvider>

        <div style={{ marginTop: 20, textAlign: "center" }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Tỷ giá ước tính: 1 USD ≈ 25.000 VND
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default WalletPage;

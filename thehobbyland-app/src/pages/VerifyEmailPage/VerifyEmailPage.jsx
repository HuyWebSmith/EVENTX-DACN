import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Spin, message, Result, Button } from "antd";
import { SmileOutlined, FrownOutlined } from "@ant-design/icons";
import { verifyEmail } from "../../services/UserService";

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      message.error("Token không hợp lệ");
      setStatus("error");
      return;
    }

    verifyEmail(token)
      .then(() => setStatus("success"))
      .catch((err) => {
        message.error(err.message || "Xác thực thất bại");
        setStatus("error");
      });
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          flexDirection: "column",
          background: "#f0f2f5",
          padding: 20,
        }}
      >
        <Spin size="large" tip="Đang xác thực email..." />
      </div>
    );
  }

  if (status === "error") {
    return (
      <Result
        status="error"
        icon={<FrownOutlined style={{ color: "#ff4d4f" }} />}
        title="Xác thực email thất bại"
        subTitle="Link xác thực không hợp lệ hoặc đã hết hạn."
        extra={[
          <Button
            key="home"
            type="primary"
            size="large"
            onClick={() => navigate("/")}
          >
            Quay về trang chủ
          </Button>,
        ]}
      />
    );
  }

  return (
    <Result
      status="success"
      icon={<SmileOutlined style={{ color: "#52c41a" }} />}
      title="Xác thực email thành công!"
      subTitle="Tài khoản của bạn đã được kích hoạt. Bạn có thể đăng nhập ngay."
      extra={[
        <Button
          type="primary"
          size="large"
          key="login"
          onClick={() => navigate("/sign-in")}
        >
          Đăng nhập
        </Button>,
      ]}
    />
  );
};

export default VerifyEmailPage;

import React, { useState, useEffect } from "react";
import {
  WrapperContainerLeft,
  WrapperContainerRight,
  WrapperTextLight,
} from "./style";
import InputFormComponent from "../../components/InputFormComponent/InputFormComponent";
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";
import LoadingComponent from "../../components/LoadingComponent/LoadingComponent";
import imageLogo from "../../assets/images/logo.png";
import { Image } from "antd";
import {
  EyeInvisibleOutlined,
  EyeOutlined,
  LockOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import * as UserService from "../../services/UserService";
import { useMutationHooks } from "../../hook/useMutationHook";
import { useMessageHook } from "../../components/Message/Message";
import BackToHomeButton from "../../components/BackToHomeButton/BackToHomeButton";

const SignUpPage = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [passwordHash, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isShowPassword, setIsShowPassword] = useState(false);
  const [isShowConfirmPassword, setIsShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const mutation = useMutationHooks(UserService.signUpUser);
  const { success, error, contextHolder } = useMessageHook();

  useEffect(() => {
    if (mutation.isSuccess) {
      success("Đăng ký thành công! Vui lòng kiểm tra email để xác thực.");
      navigate("/sign-in");
    } else if (mutation.isError) {
      error("Đăng ký thất bại!");
    }
  }, [mutation.isSuccess, mutation.isError]);

  const handleSignUp = () => {
    if (
      !fullName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !passwordHash.trim() ||
      !confirmPassword.trim()
    ) {
      setErrorMessage("Các trường không được để trống");
      return;
    }
    if (passwordHash !== confirmPassword) {
      setErrorMessage("Password và Confirm Password phải giống nhau");
      return;
    }
    setErrorMessage("");
    setIsLoading(true);

    mutation.mutate(
      { fullName, email, phone, passwordHash, confirmPassword },
      {
        onSuccess: (res) => {
          setIsLoading(false);
          if (res.status === "OK") navigate("/sign-in");
          else if (res.status === "ERR") setErrorMessage(res.message);
        },
        onError: () => {
          setIsLoading(false);
          setErrorMessage("Đăng ký thất bại, thử lại sau");
        },
      }
    );
  };

  return (
    <>
      {contextHolder}
      <BackToHomeButton />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          backgroundImage: `linear-gradient(rgba(0,0,0,0.53), rgba(0,0,0,0.53)), url(${require("../../assets/images/background.jpg")})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "800px",
            height: "500px",
            borderRadius: "10px",
            backgroundColor: "#fff",
            fontSize: "13px",
            overflow: "hidden",
          }}
        >
          <WrapperContainerLeft>
            <h1>Đăng ký tài khoản</h1>
            <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
              <div style={{ position: "relative", marginBottom: 5 }}>
                <span
                  style={{
                    position: "absolute",
                    left: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#fff",
                  }}
                >
                  <UserOutlined />
                </span>
                <InputFormComponent
                  placeholder="Full Name"
                  value={fullName}
                  onChange={setFullName}
                  style={{
                    paddingLeft: "35px",
                    background: "transparent",
                    border: "2px solid rgba(255,255,255,.2)",
                    borderRadius: "40px",
                    outline: "none",
                    color: "#fff",
                  }}
                />
              </div>
              <div style={{ position: "relative", marginBottom: 5 }}>
                <span
                  style={{
                    position: "absolute",
                    left: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#fff",
                  }}
                >
                  <MailOutlined />
                </span>
                <InputFormComponent
                  placeholder="Email"
                  value={email}
                  onChange={setEmail}
                  style={{
                    paddingLeft: "35px",
                    background: "transparent",
                    border: "2px solid rgba(255,255,255,.2)",
                    borderRadius: "40px",
                    outline: "none",
                    color: "#fff",
                  }}
                />
              </div>
              <div style={{ position: "relative", marginBottom: 5 }}>
                <span
                  style={{
                    position: "absolute",
                    left: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#fff",
                  }}
                >
                  <PhoneOutlined />
                </span>
                <InputFormComponent
                  placeholder="Phone"
                  value={phone}
                  onChange={setPhone}
                  style={{
                    paddingLeft: "35px",
                    background: "transparent",
                    border: "2px solid rgba(255,255,255,.2)",
                    borderRadius: "40px",
                    outline: "none",
                    color: "#fff",
                  }}
                />
              </div>

              {/* Password input */}
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#fff",
                  }}
                >
                  <LockOutlined />
                </span>
                <span
                  onClick={() => setIsShowPassword(!isShowPassword)}
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 8,
                    zIndex: 10,
                    cursor: "pointer",
                  }}
                >
                  {isShowPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                </span>
                <InputFormComponent
                  placeholder="Password"
                  type={isShowPassword ? "text" : "password"}
                  value={passwordHash}
                  onChange={setPassword}
                  style={{
                    paddingLeft: "35px",
                    background: "transparent",
                    border: "2px solid rgba(255,255,255,.2)",
                    borderRadius: "40px",
                    outline: "none",
                    color: "#fff",
                  }}
                />
              </div>

              {/* Confirm Password input */}
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#fff",
                  }}
                >
                  <LockOutlined />
                </span>
                <span
                  onClick={() =>
                    setIsShowConfirmPassword(!isShowConfirmPassword)
                  }
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 8,
                    zIndex: 10,
                    cursor: "pointer",
                  }}
                >
                  {isShowConfirmPassword ? (
                    <EyeOutlined />
                  ) : (
                    <EyeInvisibleOutlined />
                  )}
                </span>
                <InputFormComponent
                  placeholder="Confirm Password"
                  type={isShowConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  style={{
                    paddingLeft: "35px",
                    background: "transparent",
                    border: "2px solid rgba(255,255,255,.2)",
                    borderRadius: "40px",
                    outline: "none",
                    color: "#fff",
                  }}
                />
              </div>

              {errorMessage && (
                <span style={{ color: "red" }}>{errorMessage}</span>
              )}

              <LoadingComponent isLoading={isLoading}>
                <ButtonComponent
                  disabled={
                    !fullName ||
                    !email ||
                    !phone ||
                    !passwordHash ||
                    !confirmPassword
                  }
                  onClick={handleSignUp}
                  size={20}
                  styleButton={{
                    borderRadius: "40px",
                    background: "#ff393b",
                    height: 48,
                    width: "100%",
                    border: "none",
                    margin: "6px 0 10px",
                    boxShadow: "0 0 10px rgba(0,0,0,.1)",
                  }}
                  textButton="Đăng ký"
                  styleTextButton={{
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: 700,
                  }}
                />
              </LoadingComponent>

              <p>
                Bạn đã có tài khoản?
                <WrapperTextLight
                  onClick={() => navigate("/sign-in")}
                  style={{ cursor: "pointer", marginLeft: 5, color: "#fff" }}
                >
                  Đăng nhập
                </WrapperTextLight>
              </p>
            </div>
          </WrapperContainerLeft>

          <WrapperContainerRight>
            <Image
              src={imageLogo}
              preview={false}
              alt="Logo"
              height={203}
              width={203}
              style={{
                borderRadius: "50%",
                objectFit: "cover",
                boxShadow: "0 0 10px 5px rgba(0, 191, 255, 0.5)",
              }}
            />
            <h4 style={{ marginTop: 10 }}>Đặt vé tại EventX</h4>
          </WrapperContainerRight>
        </div>
      </div>
    </>
  );
};

export default SignUpPage;

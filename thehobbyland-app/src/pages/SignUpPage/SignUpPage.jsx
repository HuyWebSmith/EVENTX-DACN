import React, { useEffect, useState } from "react";
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
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import * as UserService from "../../services/UserService";
import { useMutationHooks } from "../../hook/useMutationHook";
import { useMessageHook } from "../../components/Message/Message";
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
  const { isSuccess, isError } = mutation;
  useEffect(() => {
    if (isSuccess) {
      success("Đăng ký thành công!");
      handleNavigateSignIn();
    } else if (isError) {
      error("Đăng ký thất bại!");
    }
  }, [isSuccess, isError]);

  const handleNavigateSignIn = () => navigate("/sign-in");

  const handleSignUp = () => {
    // Validate frontend
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
      setErrorMessage("Password và confirm password phải giống nhau");
      return;
    }

    setErrorMessage("");
    setIsLoading(true);

    // Call backend
    mutation.mutate(
      { fullName, email, phone, passwordHash, confirmPassword },
      {
        onSuccess: (res) => {
          setIsLoading(false);
          if (res.status === "OK") {
            setErrorMessage("");
            navigate("/sign-in"); // Chuyển sang login
          } else if (res.status === "ERR") {
            setErrorMessage(res.message);
          }
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,0,0,0.53)",
          height: "100vh",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "800px",
            height: "500px",
            borderRadius: "6px",
            backgroundColor: "#fff",
            fontSize: "13px",
          }}
        >
          <WrapperContainerLeft>
            <h1>Xin chào!</h1>
            <h3>Đăng ký tài khoản</h3>

            <InputFormComponent
              placeholder="Full Name"
              value={fullName}
              onChange={setFullName}
            />
            <InputFormComponent
              placeholder="Email"
              value={email}
              onChange={setEmail}
            />
            <InputFormComponent
              placeholder="Phone"
              value={phone}
              onChange={setPhone}
            />

            <div style={{ position: "relative" }}>
              <span
                onClick={() => setIsShowPassword(!isShowPassword)}
                style={{
                  zIndex: 10,
                  position: "absolute",
                  top: 4,
                  right: 8,
                }}
              >
                {isShowPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
              </span>
              <InputFormComponent
                placeholder="Password"
                type={isShowPassword ? "text" : "password"}
                value={passwordHash}
                onChange={setPassword}
              />
            </div>

            <div style={{ position: "relative" }}>
              <span
                onClick={() => setIsShowConfirmPassword(!isShowConfirmPassword)}
                style={{
                  zIndex: 10,
                  position: "absolute",
                  top: 4,
                  right: 8,
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
                  borderRadius: 4,
                  background: "rgb(255, 57, 59)",
                  height: 48,
                  width: "100%",
                  border: "none",
                  margin: "6px 0 10px",
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
                onClick={handleNavigateSignIn}
                style={{ cursor: "pointer" }}
              >
                Đăng nhập
              </WrapperTextLight>
            </p>
          </WrapperContainerLeft>

          <WrapperContainerRight>
            <Image
              src={imageLogo}
              preview={false}
              alt="image-Logo"
              height={203}
              width={203}
              style={{
                borderRadius: "50%",
                objectFit: "cover",
                boxShadow: "0 0 10px 5px rgba(0, 191, 255, 0.5)",
              }}
            />
            <h4>Đặt vé tại EventX</h4>
          </WrapperContainerRight>
        </div>
      </div>
    </>
  );
};

export default SignUpPage;

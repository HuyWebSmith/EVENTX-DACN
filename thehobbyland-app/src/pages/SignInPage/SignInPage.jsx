import React, { useState, useEffect } from "react";
import {
  WrapperContainerLeft,
  WrapperContainerRight,
  WrapperTextLight,
} from "./style";
import InputFormComponent from "../../components/InputFormComponent/InputFormComponent";
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";
import LoadingComponent from "../../components/LoadingComponent/LoadingComponent";
import imageLogo from "../../assets/images/logo_EventX.jpg";
import { Image } from "antd";
import {
  EyeInvisibleOutlined,
  EyeOutlined,
  LockOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import * as UserService from "../../services/UserService";
import { useMutationHooks } from "../../hook/useMutationHook";
import { useMessageHook } from "../../components/Message/Message";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";
import { updateUser } from "../../redux/slides/userSlide";
import BackToHomeButton from "../../components/BackToHomeButton/BackToHomeButton";

const SignInPage = () => {
  const [isShowPassword, setIsShowPassword] = useState(false);
  const navigate = useNavigate();

  const mutation = useMutationHooks(UserService.loginUser);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [email, setEmail] = useState("");
  const [passwordHash, setPassword] = useState("");
  const [showResend, setShowResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const { success, error, contextHolder } = useMessageHook();
  const dispatch = useDispatch();
  const handleGetDetailUser = async (id, token) => {
    try {
      const res = await UserService.getDetailUser(id, token);
      const userData = res.data?.data || res.data;

      dispatch(
        updateUser({
          ...userData,
          access_token: token,
        })
      );
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    setShowResend(false);
  }, [email]);

  useEffect(() => {
    if (mutation.isSuccess && mutation.data) {
      const data = mutation.data.data || mutation.data;
      console.log("Login success data:", data);

      if (data.access_token) {
        // <-- check token tồn tại
        const decoded = jwtDecode(data.access_token);

        if (decoded?.id) {
          handleGetDetailUser(decoded.id, data.access_token);
        }
      } else {
        console.warn("Không có access_token, login thất bại hoặc sai mật khẩu");
      }
    }

    if (mutation.isError) {
      console.error("Login error:", mutation.error);
      error("Lỗi hệ thống! Thử lại sau.");
    }
  }, [mutation.isSuccess, mutation.isError, mutation.data]);

  const handleNavigateSignUp = () => {
    navigate("/sign-up");
  };
  const handleResendVerify = async () => {
    try {
      setResendLoading(true);
      await UserService.resendVerifyEmail({ email });
      success("Đã gửi lại email xác thực. Vui lòng kiểm tra hộp thư 📩");
    } catch (err) {
      error("Không thể gửi lại email. Thử lại sau.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleSignIn = () => {
    if (!email.trim() || !passwordHash.trim()) {
      setErrorMessage("Email và mật khẩu không được để trống");
      return;
    }

    setErrorMessage("");
    setIsLoading(true);

    mutation.mutate(
      { email, passwordHash },
      {
        onSuccess: (res) => {
          setIsLoading(false);

          const data = res.data || res;
          if (data.status === "OK") {
            success("Đăng nhập thành công!");
            localStorage.setItem("access_token", data.access_token);
            localStorage.setItem(
              "refresh_token",
              JSON.stringify(data.refresh_token)
            );

            const decoded = jwtDecode(data.access_token);
            if (decoded?.id) {
              // Lưu currentUserId vào localStorage
              localStorage.setItem("currentUserId", decoded.id);
              handleGetDetailUser(decoded.id, data.access_token);
            }

            navigate("/");
          } else if (data.status === "ERR") {
            error(data.message);
            if (data.message?.toLowerCase().includes("xác thực")) {
              setShowResend(true);
            }
          }
        },
        onError: (err) => {
          setIsLoading(false);
          error("Lỗi hệ thống! Thử lại sau.");
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
          background: "rgba(0,0,0,0.53)",
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
            height: "445px",
            borderRadius: "10px",
            backgroundColor: "transparent",
            fontSize: "13px",
            overflow: "hidden",
            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.8)",
          }}
        >
          <WrapperContainerLeft>
            <h1>Xin chào!</h1>
            <h3>Đăng nhập và tạo tài khoản</h3>

            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                style={{ position: "absolute", left: "10px", color: "#fff" }}
              >
                <UserOutlined />
              </span>
              <InputFormComponent
                placeholder="abc@gmail.com"
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

            <div style={{ position: "relative" }}>
              <span
                onClick={() => setIsShowPassword(!isShowPassword)}
                style={{
                  zIndex: "10",
                  position: "absolute",
                  top: "4px",
                  right: "8px",
                }}
              >
                {isShowPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
              </span>

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
                    top: "4px",
                    right: "8px",
                    zIndex: 10,
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
            </div>

            {errorMessage && (
              <span style={{ color: "red" }}>{errorMessage}</span>
            )}
            {showResend && (
              <p
                onClick={handleResendVerify}
                style={{
                  color: "#00bfff",
                  cursor: resendLoading ? "not-allowed" : "pointer",
                  marginTop: "6px",
                  fontSize: "13px",
                }}
              >
                {resendLoading
                  ? "Đang gửi lại email..."
                  : "Resend email xác thực"}
              </p>
            )}

            <LoadingComponent isLoading={isLoading}>
              <ButtonComponent
                disabled={!email.length || !passwordHash.length}
                onClick={handleSignIn}
                size={20}
                styleButton={{
                  borderRadius: "40px",
                  background: "#fff",
                  height: "48px",
                  width: "100%",
                  border: "none",
                  margin: "6px 0 10px",
                  outline: "none",
                  boxShadow: "0 0 10px rgba(0,0,0,.1)",
                }}
                textButton={"Đăng nhập"}
                styleTextButton={{
                  color: "#333",
                  fontSize: "15px",
                  fontWeight: "700",
                }}
              />
            </LoadingComponent>

            <p>
              <WrapperTextLight
                style={{ cursor: "pointer", marginLeft: "2px", color: "#fff" }}
              >
                Quên mật khẩu?
              </WrapperTextLight>
            </p>

            <p>
              Chưa có tài khoản?
              <WrapperTextLight
                onClick={handleNavigateSignUp}
                style={{ cursor: "pointer", marginLeft: "2px", color: "#fff" }}
              >
                Tạo tài khoản
              </WrapperTextLight>
            </p>
          </WrapperContainerLeft>

          <WrapperContainerRight>
            <Image
              src={imageLogo}
              preview={false}
              alt="image-Logo"
              height="123px"
              width="290px"
              style={{
                objectFit: "cover",
              }}
            />
          </WrapperContainerRight>
        </div>
      </div>
    </>
  );
};

export default SignInPage;

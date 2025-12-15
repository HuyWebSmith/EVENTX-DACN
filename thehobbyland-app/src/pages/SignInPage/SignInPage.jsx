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
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import * as UserService from "../../services/UserService";
import { useMutationHooks } from "../../hook/useMutationHook";
import { useMessageHook } from "../../components/Message/Message";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";
import { updateUser } from "../../redux/slides/userSlide";
const SignInPage = () => {
  const [isShowPassword, setIsShowPassword] = useState(false);
  const navigate = useNavigate();

  const mutation = useMutationHooks(UserService.loginUser);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [email, setEmail] = useState("");
  const [passwordHash, setPassword] = useState("");

  const { success, error, contextHolder } = useMessageHook();
  const dispatch = useDispatch();
  const handleGetDetailUser = async (id, token) => {
    try {
      const res = await UserService.getDetailUser(id, token);
      const userData = res.data?.data || res.data;

      // cập nhật redux
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

            // decode JWT
            const decoded = jwtDecode(data.access_token);
            if (decoded?.id) {
              // Lưu currentUserId vào localStorage
              localStorage.setItem("currentUserId", decoded.id);
              handleGetDetailUser(decoded.id, data.access_token);
            }

            navigate("/");
          } else if (data.status === "ERR") {
            error(data.message);
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
            height: "445px",
            borderRadius: "6px",
            backgroundColor: "#fff",
            fontSize: "13px",
          }}
        >
          <WrapperContainerLeft>
            <h1>Xin chào!</h1>
            <h3>Đăng nhập và tạo tài khoản</h3>

            <InputFormComponent
              placeholder="abc@gmail.com"
              value={email}
              onChange={setEmail}
            />

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

              <InputFormComponent
                placeholder="Password"
                type={isShowPassword ? "text" : "password"}
                value={passwordHash}
                onChange={setPassword}
              />
            </div>

            {errorMessage && (
              <span style={{ color: "red" }}>{errorMessage}</span>
            )}

            <LoadingComponent isLoading={isLoading}>
              <ButtonComponent
                disabled={!email.length || !passwordHash.length}
                onClick={handleSignIn}
                size={20}
                styleButton={{
                  borderRadius: "4px",
                  background: "rgb(255, 57, 59)",
                  height: "48px",
                  width: "100%",
                  border: "none",
                  margin: "6px 0 10px",
                }}
                textButton={"Đăng nhập"}
                styleTextButton={{
                  color: "#fff",
                  fontSize: "15px",
                  fontWeight: "700",
                }}
              />
            </LoadingComponent>

            <p>
              <WrapperTextLight>Quên mật khẩu?</WrapperTextLight>
            </p>

            <p>
              Chưa có tài khoản?
              <WrapperTextLight
                onClick={handleNavigateSignUp}
                style={{ cursor: "pointer" }}
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
              height="203px"
              width="203px"
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

export default SignInPage;

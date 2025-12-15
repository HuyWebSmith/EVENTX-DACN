import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as UserService from "../../services/UserService";
import * as message from "../../components/Message/Message";
import InputFormComponent from "../../components/InputFormComponent/InputFormComponent";
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";
import LoadingComponent from "../../components/LoadingComponent/LoadingComponent";
import { jwtDecode } from "jwt-decode";
import { UserOutlined, UploadOutlined } from "@ant-design/icons";
import { getBase64 } from "../../utils";
import axios from "axios";
import { updateUser } from "../../redux/slides/userSlide";
import {
  WrapperHeader,
  WrapperContentProfile,
  WrapperLabel,
  WrapperInput,
  WrapperAvatar,
  AvatarPreview,
  UploadButton,
  UpdateButtonWrapper,
} from "./style";

const ProfilePage = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [bio, setBio] = useState("");
  const [linkedInProfile, setLinkedInProfile] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { success, error } = message.useMessageHook();

  // === Upload avatar ===
  const uploadAvatar = async (formData, token) => {
    const res = await axios.post(
      "http://localhost:3001/api/upload-image",
      formData,
      {
        headers: { token: `Bearer ${token}` },
      }
    );
    return res.data;
  };

  // === Load user data khi vào trang ===
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const decoded = jwtDecode(token);
    UserService.getDetailUser(decoded.id, token).then((res) => {
      const userData = res.data?.data || res.data;
      if (userData) {
        setFullName(userData.fullName || "");
        setEmail(userData.email || "");
        setPhone(userData.phone || "");
        setAddress(userData.address || "");
        setAvatarUrl(userData.avatarUrl || "");
        setGender(userData.gender || "");
        setBio(userData.bio || "");
        setLinkedInProfile(userData.linkedInProfile || "");

        if (userData.dateOfBirth) {
          setDateOfBirth(
            new Date(userData.dateOfBirth).toISOString().split("T")[0]
          );
        }

        dispatch(updateUser({ ...userData, access_token: token }));
      }
    });
  }, [dispatch]);

  // === Xử lý chọn ảnh ===
  const handleAvatarChange = ({ target }) => {
    const file = target.files[0];
    if (file) {
      setAvatarFile(file);
      getBase64(file).then((base64) => setAvatarUrl(base64));
    }
  };

  const handleButtonClick = () => fileInputRef.current.click();

  // === Cập nhật thông tin ===
  const handleUpdate = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return error("Vui lòng đăng nhập lại!");

    let finalAvatarUrl = avatarUrl;

    if (avatarFile) {
      const formData = new FormData();
      formData.append("image", avatarFile);
      try {
        const uploadRes = await uploadAvatar(formData, token);
        finalAvatarUrl = uploadRes.url;
      } catch (err) {
        error("Tải ảnh thất bại!");
        return;
      }
    }

    const payload = {
      fullName,
      email,
      phone,
      address,
      avatarUrl: finalAvatarUrl,
      gender,
      dateOfBirth: dateOfBirth || null,
      bio,
      linkedInProfile,
    };

    setIsLoading(true);
    try {
      const res = await UserService.updateUser({ id: user.id, data: payload });
      const updatedUser = res.data?.data || res.data;

      dispatch(updateUser({ ...updatedUser, access_token: token }));
      success("Cập nhật thành công!");
      setAvatarFile(null);
    } catch (err) {
      error("Cập nhật thất bại!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        padding: "20px 0",
      }}
    >
      <div style={{ maxWidth: "1270px", margin: "0 auto", padding: "0 15px" }}>
        <WrapperHeader>Thông tin cá nhân</WrapperHeader>

        <LoadingComponent isLoading={isLoading}>
          <WrapperContentProfile>
            {/* Avatar Section */}
            <WrapperAvatar>
              <AvatarPreview>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" />
                ) : (
                  <UserOutlined />
                )}
              </AvatarPreview>

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: "none" }}
                />
                <UploadButton onClick={handleButtonClick}>
                  <UploadOutlined />
                  Chọn ảnh đại diện
                </UploadButton>
                <div
                  style={{ fontSize: "13px", color: "#888", marginTop: "8px" }}
                >
                  Dung lượng tối đa 5MB (JPG, PNG)
                </div>
              </div>
            </WrapperAvatar>

            {/* Các field */}
            <WrapperInput>
              <WrapperLabel>Họ và tên</WrapperLabel>
              <InputFormComponent
                value={fullName}
                onChange={setFullName}
                placeholder="Nhập họ tên"
              />
            </WrapperInput>

            <WrapperInput>
              <WrapperLabel>Email</WrapperLabel>
              <InputFormComponent
                value={email}
                onChange={setEmail}
                type="email"
              />
            </WrapperInput>

            <WrapperInput>
              <WrapperLabel>Số điện thoại</WrapperLabel>
              <InputFormComponent value={phone} onChange={setPhone} />
            </WrapperInput>

            <WrapperInput>
              <WrapperLabel>Địa chỉ</WrapperLabel>
              <InputFormComponent
                value={address}
                onChange={setAddress}
                placeholder="Số nhà, đường, phường..."
              />
            </WrapperInput>

            <WrapperInput>
              <WrapperLabel>Giới tính</WrapperLabel>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                style={{
                  width: "100%",
                  maxWidth: "400px",
                  height: "44px",
                  padding: "0 12px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  fontSize: "15px",
                }}
              >
                <option value="">Chọn giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </WrapperInput>

            <WrapperInput>
              <WrapperLabel>Ngày sinh</WrapperLabel>
              <InputFormComponent
                type="date"
                value={dateOfBirth}
                onChange={setDateOfBirth}
              />
            </WrapperInput>

            <WrapperInput>
              <WrapperLabel>Tiểu sử</WrapperLabel>
              <InputFormComponent
                value={bio}
                onChange={setBio}
                placeholder="Giới thiệu ngắn về bạn..."
              />
            </WrapperInput>

            <WrapperInput>
              <WrapperLabel>LinkedIn</WrapperLabel>
              <InputFormComponent
                value={linkedInProfile}
                onChange={setLinkedInProfile}
                placeholder="https://linkedin.com/in/..."
              />
            </WrapperInput>

            <UpdateButtonWrapper>
              <ButtonComponent
                onClick={handleUpdate}
                textButton="Cập nhật thông tin"
                styleButton={{
                  background: "#37b75a",
                  border: "none",
                  color: "white",
                  height: "48px",
                  width: "220px",
                  borderRadius: "8px",
                  fontWeight: "600",
                  fontSize: "16px",
                }}
              />
            </UpdateButtonWrapper>
          </WrapperContentProfile>
        </LoadingComponent>
      </div>
    </div>
  );
};

export default ProfilePage;

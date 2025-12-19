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
import WalletStatus from "../../components/WalletStatus/WalletStatus"; // import WalletStatus
import {
  WrapperHeader,
  WrapperContentProfile,
  WrapperLabel,
  WrapperInput,
  WrapperAvatar,
  AvatarPreview,
  UploadButton,
  UpdateButtonWrapper,
  WrapperInputFields,
} from "./style";
import { Checkbox, List, Modal } from "antd";

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
  const [wallet, setWallet] = useState(null); // state wallet
  const [missions, setMissions] = useState([]); // danh sách nhiệm vụ
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { success, error } = message.useMessageHook();

  const fetchWalletMissions = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const decoded = jwtDecode(token);
      const userId = decoded.id;

      const res = await UserService.axiosJWT.get(
        `http://localhost:3001/wallet/update-status/${userId}`,
        { headers: { token: `Bearer ${token}` } }
      );

      if (res.data) {
        setMissions(res.data.missions || []);
        setWallet(res.data.wallet);
      }
    } catch (err) {
      console.error("Fetch wallet missions error:", err);
    }
  };
  const DEFAULT_MISSIONS = [
    {
      missionCode: "EMAIL_VERIFY",
      name: "Xác nhận Email",
      description: "Nhận OTP qua email",
    },
    {
      missionCode: "PROFILE_COMPLETE",
      name: "Hoàn thành Profile",
      description: "Điền đầy đủ thông tin cá nhân",
    },
    {
      missionCode: "KYC",
      name: "Hoàn tất KYC",
      description: "Xác thực danh tính",
    },
    {
      missionCode: "FIRST_TRANSACTION",
      name: "Giao dịch đầu tiên",
      description: "Thực hiện nạp/rút/đặt vé",
    },
    {
      missionCode: "GOOD_HISTORY",
      name: "Lịch sử tốt",
      description: "Không vi phạm trong 6 tháng",
    },
  ];

  const handleWalletClick = async () => {
    await fetchWalletMissions();
    setIsModalVisible(true);
  };

  // === Upload avatar ===
  const uploadAvatar = async (formData, token) => {
    const res = await axios.post(
      "http://localhost:3001/api/upload-image",
      formData,
      { headers: { token: `Bearer ${token}` } }
    );
    return res.data;
  };

  // === Load user data và wallet khi vào trang ===
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const decoded = jwtDecode(token);
    const userId = decoded.id;

    // Load user
    UserService.getDetailUser(userId, token).then((res) => {
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

    // Load wallet
    UserService.axiosJWT
      .get(`http://localhost:3001/wallet/${userId}`)
      .then((res) => {
        if (res.data?.wallet) setWallet(res.data.wallet);
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
      } catch {
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
    } catch {
      error("Cập nhật thất bại!");
    } finally {
      setIsLoading(false);
    }
  };

  // ... (giữ nguyên các import và logic xử lý bên trên)

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f0f2f5",
        padding: "40px 0",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 20px" }}>
        <WrapperHeader>Cài đặt tài khoản</WrapperHeader>

        <LoadingComponent isLoading={isLoading}>
          <WrapperContentProfile>
            {/* Cột trái: Avatar & Wallet */}
            <WrapperAvatar>
              <AvatarPreview>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" />
                ) : (
                  <UserOutlined />
                )}
              </AvatarPreview>

              {wallet && (
                <div
                  style={{ marginBottom: "20px", textAlign: "center" }}
                  onClick={handleWalletClick}
                >
                  <WalletStatus status={wallet.status} />
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#1890ff",
                      marginTop: "5px",
                      cursor: "pointer",
                    }}
                  >
                    Xem nhiệm vụ nâng cấp ví
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: "none" }}
              />
              <UploadButton
                icon={<UploadOutlined />}
                onClick={handleButtonClick}
              >
                Đổi ảnh đại diện
              </UploadButton>
            </WrapperAvatar>

            {/* Cột phải: Form thông tin chia 2 cột */}
            <WrapperInputFields>
              <WrapperInput>
                <WrapperLabel>Họ và tên</WrapperLabel>
                <InputFormComponent value={fullName} onChange={setFullName} />
              </WrapperInput>

              <WrapperInput>
                <WrapperLabel>Email</WrapperLabel>
                <InputFormComponent
                  value={email}
                  onChange={setEmail}
                  disabled
                />
              </WrapperInput>

              <WrapperInput>
                <WrapperLabel>Số điện thoại</WrapperLabel>
                <InputFormComponent value={phone} onChange={setPhone} />
              </WrapperInput>

              <WrapperInput>
                <WrapperLabel>Giới tính</WrapperLabel>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  style={{
                    height: "40px",
                    padding: "0 12px",
                    borderRadius: "6px",
                    border: "1px solid #d9d9d9",
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
                <WrapperLabel>LinkedIn</WrapperLabel>
                <InputFormComponent
                  value={linkedInProfile}
                  onChange={setLinkedInProfile}
                />
              </WrapperInput>

              <WrapperInput style={{ gridColumn: "1 / -1" }}>
                <WrapperLabel>Địa chỉ</WrapperLabel>
                <InputFormComponent value={address} onChange={setAddress} />
              </WrapperInput>

              <WrapperInput style={{ gridColumn: "1 / -1" }}>
                <WrapperLabel>Tiểu sử</WrapperLabel>
                <InputFormComponent value={bio} onChange={setBio} />
              </WrapperInput>

              <UpdateButtonWrapper>
                <ButtonComponent
                  onClick={handleUpdate}
                  textButton="Lưu thay đổi"
                  styleButton={{
                    background: "#1890ff",
                    border: "none",
                    color: "white",
                    height: "40px",
                    padding: "0 30px",
                    borderRadius: "6px",
                    fontWeight: "500",
                  }}
                />
              </UpdateButtonWrapper>
            </WrapperInputFields>
          </WrapperContentProfile>
        </LoadingComponent>
      </div>

      {/* Modal Mission với giao diện sạch hơn */}
      <Modal
        title="Tiến trình nâng cấp tài khoản"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        centered
      >
        {/* Merge missions backend với DEFAULT_MISSIONS */}
        {(() => {
          // Tạo map của missions từ backend
          const missionMap = {};
          missions.forEach((m) => {
            missionMap[m.missionCode] = m.isCompleted;
          });

          // Merge với DEFAULT_MISSIONS
          const allMissions = DEFAULT_MISSIONS.map((dm) => ({
            ...dm,
            isCompleted: missionMap[dm.missionCode] || false,
          }));

          const completedCount = allMissions.filter(
            (m) => m.isCompleted
          ).length;
          const totalCount = allMissions.length;

          return (
            <>
              <div style={{ marginBottom: "10px", fontWeight: 600 }}>
                Hoàn thành {completedCount} / {totalCount} nhiệm vụ
              </div>
              <List
                dataSource={allMissions}
                renderItem={(item) => (
                  <List.Item>
                    <Checkbox checked={item.isCompleted} disabled>
                      {item.name} {item.description && `- ${item.description}`}
                    </Checkbox>
                  </List.Item>
                )}
              />
            </>
          );
        })()}
      </Modal>
    </div>
  );
};

export default ProfilePage;

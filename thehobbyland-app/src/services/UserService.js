import axios from "axios";

const API = process.env.REACT_APP_API_KEY || "/api";

export const axiosJWT = axios.create();

// =============================
//  INTERCEPTOR GẮN TOKEN + REFRESH TOKEN
// =============================
axiosJWT.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosJWT.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Thay đổi từ 403 thành 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // ... (phần còn lại của logic làm mới token, bạn đã có sẵn) ...
        const res = await axios.post(
          `${API}/user/refresh-token`,
          {}, // Hãy chắc chắn rằng refresh token được gửi đi đúng cách (ví dụ: qua cookie hoặc body)
          { withCredentials: true }
        );

        const newAccessToken = res.data?.access_token;
        localStorage.setItem("access_token", newAccessToken);

        axiosJWT.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newAccessToken}`;

        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        return axiosJWT(originalRequest);
      } catch (err) {
        console.log("Refresh token failed:", err);
        // Có thể thêm logic để đăng xuất người dùng nếu refresh token cũng hết hạn/không hợp lệ
      }
    }

    return Promise.reject(error);
  }
);

// =============================
//  API FUNCTIONS
// =============================

export const loginUser = async (data) => {
  const res = await axios.post(`${API}/user/sign-in`, data, {
    withCredentials: true,
  });
  return res.data;
};

export const signUpUser = async (data) => {
  const res = await axios.post(`${API}/user/sign-up`, data);
  return res.data;
};

export const getDetailUser = async (id) => {
  console.debug(
    "UserService.getDetailUser -> URL:",
    `${API}/user/get-details/${id}`
  );
  const res = await axiosJWT.get(`${API}/user/get-details/${id}`);
  return res.data;
};

export const refreshToken = async () => {
  const res = await axios.post(
    `${API}/user/refresh-token`,
    {},
    { withCredentials: true }
  );
  return res.data;
};

export const logoutUser = async () => {
  const res = await axios.post(
    `${API}/user/log-out`,
    {},
    { withCredentials: true }
  );
  return res.data;
};

export const updateUser = async ({ id, data }) => {
  const res = await axiosJWT.put(`${API}/user/update-user/${id}`, data);
  return res.data;
};

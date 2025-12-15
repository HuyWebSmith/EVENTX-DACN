import axios from "axios";
import { axiosJWT } from "./UserService";

export const getAllEvent = async (limit) => {
  try {
    const API = process.env.REACT_APP_API_KEY || "/api";
    console.debug(
      "ProductService.getAllEvent -> URL:",
      `${API}/product/get-all`
    );
    const url = `${API}/product/get-all?limit=${limit}`;

    const res = await axios.get(url);

    return res.data;
  } catch (error) {
    console.error("ProductService.getAllEvent error:", {
      message: error.message,
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      responseData: error.response?.data,
    });
    throw error;
  }
};

export const deleteManyProduct = async (ids, access_token) => {
  const res = await axiosJWT.delete(
    `${process.env.REACT_APP_API_KEY}/product/delete-many`,
    {
      data: { ids },
      headers: {
        token: `Bearer ${access_token}`,
      },
    }
  );
  return res.data;
};

export const getDetailsEvent = async (id) => {
  try {
    console.debug(
      "ProductService.getDetailsEvent -> URL:",
      `${process.env.REACT_APP_API_KEY}/event/get-details/${id}`
    );

    const res = await axios.get(
      `${process.env.REACT_APP_API_KEY}/event/get-details/${id}`
    );

    // Kiểm tra và trả về phần 'data' (là đối tượng event) nếu thành công
    if (res.data?.status === "OK") {
      return res.data.data;
    } else {
      // Nếu API trả về lỗi nhưng status HTTP là 200 (ví dụ: message: "The event is not defined")
      throw new Error(res.data?.message || "Không thể tải chi tiết sự kiện.");
    }
  } catch (error) {
    // Xử lý và ghi log lỗi mạng hoặc lỗi API (ví dụ: status 404/500)
    console.error("ProductService.getDetailsEvent error:", {
      message: error.message,
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      responseData: error.response?.data,
    });
    // Ném lỗi để ProductDetailPage có thể bắt và hiển thị
    throw error;
  }
};

export const getEventsByUserId = async (userId, access_token) => {
  try {
    const API = process.env.REACT_APP_API_KEY;
    console.debug(
      "ProductService.getEventsByUserId -> URL:",
      `${API}/product/get-by-user/${userId}`
    ); // Sử dụng axiosJWT để đảm bảo token được gửi và làm mới (nếu cần)

    const res = await axiosJWT.get(`${API}/product/get-by-user/${userId}`, {
      headers: {
        // Đảm bảo header token được gửi đúng
        token: `Bearer ${access_token}`,
      },
    }); // Kiểm tra và trả về phần 'data' (là mảng sự kiện)

    if (res.data?.status === "OK") {
      return res.data.data;
    } else {
      throw new Error(
        res.data?.message || "Không thể tải danh sách sự kiện của người dùng."
      );
    }
  } catch (error) {
    console.error("ProductService.getEventsByUserId error:", {
      message: error.message,
      status: error.response?.status,
    });
    throw error;
  }
};
export const getTrendingEvents = async () => {
  const API = process.env.REACT_APP_API_KEY || "/api";

  console.debug(
    "ProductService.getTrendingEvents -> URL:",
    `${API}/event/trending`
  );

  const res = await axios.get(`${API}/event/trending`);
  return res.data;
};

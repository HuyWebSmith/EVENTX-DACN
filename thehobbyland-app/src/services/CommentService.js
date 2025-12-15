import axios from "axios";

// Lấy token từ localStorage (hoặc Redux)
const getToken = () => localStorage.getItem("access_token");

// Lấy danh sách comment
export const getCommentsByEvent = (eventId) => {
  return axios.get(`/api/comments/${eventId}`);
};

// Tạo comment có gửi token
export const createComment = (data) => {
  const token = getToken();
  console.log("data sent:", data);

  return axios.post(`/api/comments`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

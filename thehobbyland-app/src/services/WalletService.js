import axios from "axios";

export const addBalance = async (userId, amount) => {
  const token = localStorage.getItem("access_token");
  console.log("token:", token);
  return axios.post(
    "http://localhost:3000/wallet/add",
    { amount },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const deductBalance = async (userId, amount) => {
  try {
    const token = localStorage.getItem("access_token");
    const res = await axios.post(
      "http://localhost:3000/wallet/deduct",
      { amount },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  } catch (err) {
    console.error(err.response?.data || err.message);
    return {
      success: false,
      message: err.response?.data?.message || err.message,
    };
  }
};

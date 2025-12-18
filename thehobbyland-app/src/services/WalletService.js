import axios from "axios";

export const addBalance = async (userId, amount) => {
  return axios.post("http://localhost:3000/wallet/add", { userId, amount });
};

export const deductBalance = async (userId, amount) => {
  try {
    const res = await axios.post("http://localhost:3000/wallet/deduct", {
      userId,
      amount,
    });
    return res.data;
  } catch (err) {
    console.error(err.response?.data || err.message);
    return {
      success: false,
      message: err.response?.data?.message || err.message,
    };
  }
};

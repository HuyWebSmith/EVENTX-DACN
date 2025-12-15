import { axiosJWT } from "./UserService";

export const addBalance = async (userId, amount) => {
  return axiosJWT.post(`/wallet/add`, { userId, amount });
};

export const deductBalance = async (userId, amount) => {
  return axiosJWT.post(`/wallet/deduct`, { userId, amount });
};

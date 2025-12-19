import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  avatarUrl: "",
  gender: "",
  dateOfBirth: "",
  bio: "",
  id: "",
  linkedInProfile: "",
  access_token: "",
  isAdmin: false,
  favorites: [],
  walletBalance: 0,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateUser: (state, action) => {
      const {
        fullName,
        email,
        access_token,
        phone,
        address,
        _id,
        avatarUrl,
        gender,
        dateOfBirth,
        bio,
        linkedInProfile,
        isAdmin,
        walletBalance,
        refreshToken,
        favorites = [], // luôn có giá trị mặc định
      } = action.payload;

      state.fullName = fullName;
      state.email = email;
      state.access_token = access_token;
      state.phone = phone;
      state.address = address;
      state.avatarUrl = avatarUrl;
      state.gender = gender;
      state.dateOfBirth = dateOfBirth;
      state.bio = bio;
      state.id = _id;
      state.linkedInProfile = linkedInProfile;
      state.isAdmin = isAdmin;
      state.favorites = favorites;
      state.refreshToken = refreshToken;
      if (walletBalance !== undefined) {
        state.walletBalance = walletBalance;
      }
    },

    resetUser: (state) => {
      Object.assign(state, initialState); // reset toàn bộ về initialState
    },

    loginSuccess: (state, action) => {
      // cập nhật toàn bộ thông tin user, bao gồm favorites
      Object.assign(state, {
        ...initialState, // đảm bảo mọi field luôn tồn tại
        ...action.payload,
        favorites: action.payload.favorites || [],
      });
    },

    updateWalletBalance: (state, action) => {
      state.walletBalance = action.payload;
    },

    updateFavorites: (state, action) => {
      // để cập nhật trực tiếp favorites khi thêm/xóa
      state.favorites = action.payload || [];
    },
  },
});

// Action creators
export const {
  updateUser,
  resetUser,
  loginSuccess,
  updateWalletBalance,
  updateFavorites,
} = userSlice.actions;

export default userSlice.reducer;

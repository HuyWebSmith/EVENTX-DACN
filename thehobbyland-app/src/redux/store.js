import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage"; // Sử dụng localStorage

// Import các reducers từ các slides của người dùng
import counterReducer from "./slides/counterSlide";
import userReducer from "./slides/userSlide";
import orderReducer from "./slides/orderSlice";

const rootReducer = combineReducers({
  // Thêm tất cả các reducers vào rootReducer
  counter: counterReducer,
  user: userReducer,
  order: orderReducer,
});

const persistConfig = {
  key: "root",
  storage,
  // 🛑 QUAN TRỌNG: Chỉ định slice 'user' cần được lưu trữ
  // counter và order sẽ không được persist (chỉ slice user được lưu)
  whitelist: ["user"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// 🛑 EXPORT persistor 🛑
export const persistor = persistStore(store);

// Export store (Dùng export const thay vì export default)
// export default store; // Nếu bạn dùng default, phải thay đổi import

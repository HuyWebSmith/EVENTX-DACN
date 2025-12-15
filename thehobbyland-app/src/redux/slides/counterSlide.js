import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tickets: [], // [{ _id, name, price }]
  selectedQuantities: {}, // { ticketId: quantity }
  totalPrice: 0,
  totalQuantity: 0,
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    addTicketToOrder: (state, action) => {
      // action.payload = { _id, name, price, quantity }
      const { _id, name, price, quantity } = action.payload;

      // Thêm ticket nếu chưa có
      if (!state.tickets.find((t) => t._id === _id)) {
        state.tickets.push({ _id, name, price });
      }

      // Cập nhật số lượng
      state.selectedQuantities[_id] = quantity;

      // Tính lại tổng
      state.totalQuantity = Object.values(state.selectedQuantities).reduce(
        (a, b) => a + b,
        0
      );
      state.totalPrice = state.tickets.reduce((acc, t) => {
        const qty = state.selectedQuantities[t._id] || 0;
        return acc + t.price * qty;
      }, 0);
    },

    removeTicketFromOrder: (state, action) => {
      const _id = action.payload;
      state.selectedQuantities[_id] = 0;
      state.tickets = state.tickets.filter((t) => t._id !== _id);

      state.totalQuantity = Object.values(state.selectedQuantities).reduce(
        (a, b) => a + b,
        0
      );
      state.totalPrice = state.tickets.reduce((acc, t) => {
        const qty = state.selectedQuantities[t._id] || 0;
        return acc + t.price * qty;
      }, 0);
    },

    clearOrder: (state) => {
      state.tickets = [];
      state.selectedQuantities = {};
      state.totalPrice = 0;
      state.totalQuantity = 0;
    },
  },
});

// Export action để dùng trong component
export const { addTicketToOrder, removeTicketFromOrder, clearOrder } =
  orderSlice.actions;

export default orderSlice.reducer;

const initialState = {
  holdItems: [], // vé đang giữ
};

export default function orderReducer(state = initialState, action) {
  switch (action.type) {
    case "order/addTicketToHold":
      return {
        ...state,
        holdItems: [...state.holdItems, action.payload],
      };

    case "order/removeItem":
      return {
        ...state,
        holdItems: state.holdItems.filter(
          (item) => item.ticketId !== action.payload
        ),
      };

    default:
      return state;
  }
}

// ACTION
export const addTicketToHold = (payload) => ({
  type: "order/addTicketToHold",
  payload,
});

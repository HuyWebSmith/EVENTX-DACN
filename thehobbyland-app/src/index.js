import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import GlobalStyle from "./styles/GlobalStyle";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "antd/dist/reset.css";
import { Provider } from "react-redux";
// Cần import store VÀ persistor
import { store, persistor } from "./redux/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
// 🛑 IMPORT PersistGate 🛑
import { PersistGate } from "redux-persist/integration/react";

const root = ReactDOM.createRoot(document.getElementById("root"));
const queryClient = new QueryClient();

root.render(
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <>
          <GlobalStyle />
          <App />
          <ReactQueryDevtools initialIsOpen={false} />
        </>
      </PersistGate>
    </Provider>
  </QueryClientProvider>
);

reportWebVitals();

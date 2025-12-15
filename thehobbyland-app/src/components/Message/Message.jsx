import { message } from "antd";

export const useMessageHook = () => {
  const [messageApi, contextHolder] = message.useMessage();

  const success = (mes = "Success") => {
    messageApi.open({
      type: "success",
      content: mes,
    });
  };

  const error = (mes = "Error") => {
    messageApi.open({
      type: "error",
      content: mes,
    });
  };

  const warning = (mes = "Warning") => {
    messageApi.open({
      type: "warning",
      content: mes,
    });
  };

  return { success, error, warning, contextHolder };
};

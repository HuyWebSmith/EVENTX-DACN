import { useEffect } from "react";
import { notification } from "antd";

const useNotificationSocket = (userId) => {
  useEffect(() => {
    if (!userId) return;

    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "AUTH",
          userId,
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "NOTIFICATION") {
        notification.open({
          message: data.title,
          description: data.message,
        });
      }
    };

    return () => ws.close();
  }, [userId]);
};

export default useNotificationSocket;

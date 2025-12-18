import { Button } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const BackToHomeButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      type="text" // nút kiểu text cho gọn
      icon={<HomeOutlined />}
      onClick={() => navigate("/")}
      style={{
        position: "absolute",
        top: 20,
        left: 20,
        fontSize: 18,
        display: "flex",
        alignItems: "center",
        gap: 5,
        color: "#fff",
      }}
    ></Button>
  );
};

export default BackToHomeButton;

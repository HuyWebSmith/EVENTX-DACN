import { Menu } from "antd";
import React, { useState } from "react";
import {
  AppstoreOutlined,
  UserOutlined,
  SettingOutlined,
  BuildOutlined,
} from "@ant-design/icons";
import HeaderComponent from "../../components/HeaderComponent/HeaderComponent";
import AdminUser from "../../components/AdminUser/AdminUser";
import AdminEvent from "../../components/AdminEvent/AdminEvent";
import AdminCategory from "../../components/AdminCategory/AdminCategory";

const items = [
  {
    key: "user",
    icon: <UserOutlined />,
    label: "Người dùng",
  },
  {
    key: "event",
    icon: <AppstoreOutlined />,
    label: "Event",
  },
  {
    key: "category",
    icon: <BuildOutlined />,
    label: "Category",
  },
  {
    key: "3",
    icon: <SettingOutlined />,
    label: "Settings",
  },
];

const getLevelKeys = (items) => {
  const keys = {};
  const traverse = (items, level = 1) => {
    items.forEach((item) => {
      if (item.key) keys[item.key] = level;
      if (item.children) traverse(item.children, level + 1);
    });
  };
  traverse(items);
  return keys;
};

const levelKeys = getLevelKeys(items);

const AdminPage = () => {
  const [openKeys, setOpenKeys] = useState(["1"]);
  const [selectedKeys, setSelectedKeys] = useState(["11"]);
  const renderPage = (key) => {
    switch (key) {
      case "user":
        return <AdminUser />;
      case "event":
        return <AdminEvent />;
      case "category":
        return <AdminCategory />;
      default:
        return <></>;
    }
  };
  const onOpenChange = (keys) => {
    const latest = keys.find((key) => !openKeys.includes(key));
    if (latest) {
      const level = levelKeys[latest];
      setOpenKeys(
        keys.filter((key) => levelKeys[key] < level || key === latest)
      );
    } else {
      setOpenKeys(keys);
    }
  };

  const handleOnClick = (info) => {
    setSelectedKeys([info.key]);
    console.log(info);
  };

  return (
    <>
      <HeaderComponent isHiddenSearch isHiddenCart />
      <div style={{ display: "flex" }}>
        <Menu
          mode="inline"
          style={{ width: 256, boxShadow: "1px 1px 2px #ccc", height: "100vh" }}
          items={items}
          openKeys={openKeys}
          onOpenChange={onOpenChange}
          selectedKeys={selectedKeys}
          onClick={handleOnClick}
        />
        <div style={{ flex: 1, padding: 15 }}>
          {renderPage(selectedKeys[0])}
        </div>
      </div>
    </>
  );
};

export default AdminPage;

import React, { useEffect, useState, useRef } from "react";

import { WrapperHeader } from "./style";
import {
  Button,
  Modal,
  Form,
  Input,
  Upload,
  Select,
  Image,
  Popconfirm,
} from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import TableComponent from "../TableComponent/TableComponent";
import { axiosJWT } from "../../services/UserService";
import { Space } from "antd";
import Highlighter from "react-highlight-words";
import { SearchOutlined } from "@ant-design/icons";
import LoadingComponent from "../LoadingComponent/LoadingComponent";

const AdminUser = () => {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [allUsers, setAllUsers] = useState([]);
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (page = 1) => {
    try {
      setIsLoading(true);
      const res = await axiosJWT.get(
        `/api/user/get-all?limit=${pageSize}&page=${page}`
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
      setUsers(res.data.data);
      setAllUsers(res.data.data); // lưu tạm cho search
      setTotalUsers(res.data.total);
      setCurrentPage(page);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
    }
  };
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    const value = selectedKeys[0] || "";
    setSearchText(value);
    setSearchedColumn(dataIndex);

    const filtered = users.filter((user) =>
      user[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase())
    );

    setUsers(filtered);
    setTotalUsers(filtered.length);
    setCurrentPage(1);
    confirm();
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
    setUsers(allUsers);
    setTotalUsers(allUsers.length);
    setCurrentPage(1);
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Tìm ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Tìm
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button type="link" size="small" onClick={() => close()}>
            Đóng
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const handleDelete = async (user) => {
    try {
      await axiosJWT.delete(`/api/user/delete-user/${user._id}`);
      fetchUsers(currentPage);
    } catch (err) {
      console.error(err);
    }
  };

  const normFile = (e) =>
    e?.fileList.map((file) => ({
      uid: file.uid,
      name: file.name,
      status: "done",
      url: file.response?.url || file.url,
    })) || [];

  const uploadToCloudinary = async ({ file, onSuccess, onError }) => {
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      onSuccess(data, file);
    } catch (err) {
      onError(err);
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
    form.setFieldsValue({
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      gender: user.gender,
      rolePreference: user.rolePreference,
      avatarUrl: user.avatarUrl
        ? [
            {
              uid: "-1",
              name: "avatar.png",
              status: "done",
              url: user.avatarUrl,
            },
          ]
        : [],
    });
  };

  const onFinish = async (values) => {
    const payload = { ...values, avatarUrl: values.avatarUrl?.[0]?.url || "" };
    try {
      if (editingUser) {
        await axiosJWT.put(`/api/user/update-user/${editingUser._id}`, payload);
        setEditingUser(null);
        setIsModalOpen(false);
        fetchUsers(currentPage);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const userColumns = [
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      key: "fullName",
      ...getColumnSearchProps("fullName"),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      ...getColumnSearchProps("email"),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      ...getColumnSearchProps("phone"),
    },
    { title: "Vai trò", dataIndex: "rolePreference", key: "rolePreference" },
    {
      title: "Avatar",
      dataIndex: "avatarUrl",
      key: "avatar",
      render: (url) => url && <Image width={50} src={url} />,
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            style={{ backgroundColor: "#fff" }}
            onClick={() => openEditModal(record)}
          >
            <EditOutlined style={{ color: "blue", fontSize: "24px" }} />
          </Button>
          <Popconfirm title="Xóa?" onConfirm={() => handleDelete(record)}>
            <Button style={{ backgroundColor: "#fff", border: "none" }} danger>
              <DeleteOutlined style={{ color: "red", fontSize: "24px" }} />
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <LoadingComponent isLoading={isLoading}>
      <WrapperHeader>Quản lý người dùng</WrapperHeader>
      <div style={{ marginTop: 20 }}>
        <TableComponent
          data={users}
          columns={userColumns}
          total={totalUsers}
          pageSize={pageSize}
          currentPage={currentPage}
          onPageChange={fetchUsers}
        />
      </div>

      <Modal
        title="Chi tiết người dùng"
        centered
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ maxWidth: 600, margin: "0 auto" }}
        >
          <Form.Item
            label="Họ và tên"
            name="fullName"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true }, { type: "email" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Vai trò"
            name="rolePreference"
            rules={[{ required: true }]}
          >
            <Select placeholder="Chọn vai trò">
              <Select.Option value="Attendee">Attendee</Select.Option>
              <Select.Option value="Speaker">Speaker</Select.Option>
              <Select.Option value="Sponsor">Sponsor</Select.Option>
              <Select.Option value="Organizer">Organizer</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Avatar"
            name="avatarUrl"
            valuePropName="fileList"
            getValueFromEvent={normFile}
          >
            <Upload listType="picture-card" customRequest={uploadToCloudinary}>
              <div>
                <PlusOutlined />
                <div>Tải lên</div>
              </div>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Cập nhật
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </LoadingComponent>
  );
};

export default AdminUser;

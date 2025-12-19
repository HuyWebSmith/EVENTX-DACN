import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Upload,
  message,
  Popconfirm,
} from "antd";
import {
  InboxOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import axios from "axios";
// import axios from 'axios'; // Giả định bạn dùng axios để gọi API

const { Dragger } = Upload;

const AdminSlider = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]); // Dữ liệu từ Mongo
  const [editingKey, setEditingKey] = useState(null);
  const [form] = Form.useForm();

  // --- HÀM HỖ TRỢ UPLOAD & NORM FILE ---
  // --- HÀM HỖ TRỢ UPLOAD & NORM FILE ---
  const normFile = (e) => {
    if (!e) return [];
    if (Array.isArray(e)) return e;
    return e.fileList.map((file) => ({
      uid: file.uid,
      name: file.name,
      status: file.status || "done",
      // Lấy URL trả về từ server để hiển thị thumbnail
      url: file.response?.url || file.url,
    }));
  };

  const uploadToCloudinary = async ({ file, onSuccess, onError }) => {
    const formData = new FormData();

    // SỬA "file" THÀNH "image" CHO KHỚP VỚI BACKEND CỦA BẠN
    formData.append("image", file);

    try {
      // Nếu trong index.js bạn dùng app.use("/api/upload-image", uploadRoute)
      // thì đường dẫn này là chính xác
      const res = await fetch("http://localhost:3001/api/upload-image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        onSuccess(data, file);
        // Nạp URL trả về vào Form
        form.setFieldsValue({ img: data.url });
        message.success("Upload thành công!");
      } else {
        onError(data);
      }
    } catch (err) {
      onError(err);
    }
  };
  // 1. Lấy dữ liệu từ MongoDB khi load trang
  const fetchSliders = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:3001/api/slider/get-all");
      if (res.data.status === "OK") {
        setDataSource(res.data.data);
      }
    } catch (error) {
      message.error("Không thể tải dữ liệu slider");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSliders();
  }, []);

  // 2. Định nghĩa các cột của Bảng
  const columns = [
    {
      title: "Hình ảnh",
      dataIndex: "img",
      key: "img",
      width: 150,
      render: (url) => (
        <img
          src={url}
          alt="slider"
          style={{
            width: "100px",
            height: "60px",
            objectFit: "cover",
            borderRadius: "4px",
            border: "1px solid #eee",
          }}
        />
      ),
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: "Phân loại (Sub)",
      dataIndex: "sub",
      key: "sub",
    },
    {
      title: "Người tạo",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined style={{ color: "#1890ff" }} />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Xóa slider này?"
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 3. Các hàm xử lý Logic
  const handleEdit = (record) => {
    setEditingKey(record._id);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/slider/delete/${id}`);
      message.success("Đã xóa khỏi MongoDB");
      fetchSliders(); // Load lại bảng
    } catch (error) {
      message.error("Xóa thất bại");
    }
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      // Sử dụng URL đầy đủ để tránh lỗi Proxy của React
      const res = await axios.post(
        "http://localhost:3001/api/slider/create",
        values
      );

      if (res.data.status === "OK") {
        message.success("Lưu vào MongoDB thành công!");
        setIsModalOpen(false);
        fetchSliders(); // Load lại bảng
      }
    } catch (error) {
      console.error("Lỗi chi tiết:", error.response?.data || error.message);
      message.error("Lỗi khi kết nối với Server!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ margin: 0 }}>Quản lý Slider Hệ thống</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingKey(null);
            form.resetFields();
            setIsModalOpen(true);
          }}
          size="large"
        >
          Thêm Slider
        </Button>
      </div>

      {/* HIỂN THỊ BẢNG DỮ LIỆU */}
      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 6 }}
        bordered
      />

      {/* MODAL THÊM/SỬA (Dùng Dragger như bạn muốn) */}
      <Modal
        title={editingKey ? "Chỉnh sửa Banner" : "Thêm Banner Mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ marginTop: 20 }}
        >
          <Form.Item
            label="Tiêu đề chính"
            name="title"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Hình ảnh"
            name="imageFileList" // Tên này để quản lý danh sách file hiển thị
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[{ required: true, message: "Vui lòng upload ảnh!" }]}
          >
            <Dragger
              name="file"
              customRequest={uploadToCloudinary} // Dùng hàm bạn vừa thêm
              multiple={false}
              maxCount={1}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Kéo thả ảnh vào đây</p>
            </Dragger>
          </Form.Item>

          <Form.Item name="img" hidden>
            <Input />
          </Form.Item>

          <div style={{ display: "flex", gap: "20px" }}>
            <Form.Item label="Chủ đề (Sub)" name="sub" style={{ flex: 1 }}>
              <Input />
            </Form.Item>
            <Form.Item label="Tổ chức" name="name" style={{ flex: 1 }}>
              <Input />
            </Form.Item>
          </div>

          <Form.Item label="Mô tả chi tiết" name="desc">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminSlider;

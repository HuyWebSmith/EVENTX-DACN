import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Switch,
  message,
  Popconfirm,
} from "antd";
import * as CategoryService from "../../services/CategoryService";

const AdminCategory = () => {
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const fetchCategories = async () => {
    try {
      const res = await CategoryService.getAll();
      setCategories(res.data?.data || []);
    } catch (err) {
      message.error("Không thể tải danh mục");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editing) {
        await CategoryService.update(editing._id, values);
        message.success("Cập nhật thành công");
      } else {
        await CategoryService.create(values);
        message.success("Tạo mới thành công");
      }

      setOpen(false);
      form.resetFields();
      fetchCategories();
    } catch {
      message.error("Có lỗi xảy ra");
    }
  };

  const handleDelete = async (id) => {
    try {
      await CategoryService.remove(id);
      message.success("Xóa thành công");
      fetchCategories();
    } catch {
      message.error("Không xóa được danh mục");
    }
  };

  const columns = [
    {
      title: "Tên danh mục",
      dataIndex: "name",
      width: "20%",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      width: "40%",
    },
    {
      title: "Kích hoạt",
      dataIndex: "isActive",
      width: "15%",
      render: (v) =>
        v ? (
          <span style={{ color: "green" }}>● Active</span>
        ) : (
          <span style={{ color: "red" }}>● Inactive</span>
        ),
    },
    {
      title: "Hành động",
      width: "25%",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 10 }}>
          <Button
            onClick={() => {
              setEditing(record);
              form.setFieldsValue(record);
              setOpen(true);
            }}
          >
            Sửa
          </Button>

          <Popconfirm
            title="Bạn chắc chắn muốn xóa?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => handleDelete(record._id)}
          >
            <Button danger>Xóa</Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Button
        type="primary"
        style={{ marginBottom: 16 }}
        onClick={() => {
          setEditing(null);
          form.resetFields();
          setOpen(true);
        }}
      >
        Thêm Category
      </Button>

      <Table rowKey="_id" dataSource={categories} columns={columns} bordered />

      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        title={editing ? "Cập nhật Category" : "Thêm Category"}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Tên"
            name="name"
            rules={[{ required: true, message: "Không được bỏ trống" }]}
          >
            <Input placeholder="Tên danh mục" />
          </Form.Item>

          <Form.Item label="Mô tả" name="description">
            <Input placeholder="Mô tả" />
          </Form.Item>

          <Form.Item name="isActive" label="Kích hoạt" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminCategory;

import React, { useEffect, useRef, useState } from "react";
import { WrapperHeader } from "../AdminUser/style";
import axios from "axios";
import {
  Button,
  DatePicker,
  Dropdown,
  Form,
  Image,
  Modal,
  Popconfirm,
  Select,
  Space,
  TimePicker,
  Upload,
} from "antd";
import {
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import TableComponent from "../TableComponent/TableComponent";
import TextArea from "antd/es/input/TextArea";
import RichTextEditor from "../RichTextEditor/RichTextEditor";
import InputComponent from "../inputComponent/inputComponent";
import { useSelector } from "react-redux";
import { axiosJWT } from "../../services/UserService";
import dayjs from "dayjs";
import Highlighter from "react-highlight-words";
import LoadingComponent from "../LoadingComponent/LoadingComponent";
const AdminEvent = () => {
  const [IsModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [description, setDescription] = useState("");
  const currentUser = useSelector((state) => state.user);
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);

  const [totalEvents, setTotalEvents] = useState(0);
  const [pageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allEvents, setAllEvents] = useState([]);
  useEffect(() => {
    fetchEvents();
  }, []);
  const openCreateModal = () => {
    setEditingEvent(null); // reset editingEvent
    form.resetFields(); // reset form
    setDescription(""); // reset RichTextEditor
    setIsModalOpen(true); // mở modal
  };
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    const value = selectedKeys[0] || "";

    setSearchText(value);
    setSearchedColumn(dataIndex);

    const filtered = allEvents.filter((e) =>
      e[dataIndex]?.toLowerCase().includes(value.toLowerCase())
    );

    setEvents(filtered);
    setTotalEvents(filtered.length);
    setCurrentPage(1);
    confirm();
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
    setEvents(allEvents);
    setTotalEvents(allEvents.length);
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
        <InputComponent
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
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
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button type="link" size="small" onClick={() => close()}>
            Close
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
  const paginatedEvents = events.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const eventColumns = [
    {
      title: "Tên sự kiện",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => (a.title?.length || 0) - (b.title?.length || 0),
      ...getColumnSearchProps("title"),
    },
    {
      title: "Ngày tổ chức",
      dataIndex: "eventDate",
      key: "eventDate",
      sorter: (a, b) =>
        new Date(a.eventDate)?.getTime() - new Date(b.eventDate)?.getTime(),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <Select
          value={status}
          onChange={(newStatus) => handleChangeStatus(record._id, newStatus)}
          style={{ width: 120 }}
        >
          <Select.Option value="Pending">Pending</Select.Option>
          <Select.Option value="Approved">Approved</Select.Option>
          <Select.Option value="Rejected">Rejected</Select.Option>
        </Select>
      ),
    },
    {
      title: "Người tổ chức",
      dataIndex: "organizerName",
      key: "organizerName",
      sorter: (a, b) =>
        (a.organizerName || "").localeCompare(b.organizerName || ""),
    },
    {
      title: "Logo",
      dataIndex: "organizerLogoUrl",
      key: "logo",
      render: (url) => url && <Image width={50} src={url} />,
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            style={{ backgroundColor: "#fff" }}
            type="primary"
            onClick={() => openEditModal(record)}
          >
            <EditOutlined style={{ color: "blue", fontSize: "30px" }} />
          </Button>
          <Popconfirm title="Xóa?" onConfirm={() => handleDelete(record)}>
            <Button style={{ backgroundColor: "#fff", border: "none" }} danger>
              <DeleteOutlined style={{ color: "red", fontSize: "30px" }} />
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];
  const handleChangeStatus = async (eventId, newStatus) => {
    try {
      await axiosJWT.put(
        `http://localhost:3001/api/event/update-status/${eventId}`,
        { status: newStatus }
      );
      fetchEvents();
    } catch (err) {
      console.error(err);
      Modal.error({ title: "Lỗi", content: "Không thể thay đổi trạng thái" });
    }
  };
  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`http://localhost:3001/api/event/get-all`);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setAllEvents(res.data.data);
      setEvents(res.data.data);
      setTotalEvents(res.data.total);
      console.log("res.data.data.length", res.data.data.length);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (event) => {
    try {
      await axiosJWT.delete(
        `http://localhost:3001/api/event/delete/${event._id}`
      );
      fetchEvents();
    } catch (err) {
      console.log(err);
    }
  };

  // Hàm chuyển file list sang array url
  const normFile = (e) => {
    if (!e) return [];
    return e.fileList.map((file) => ({
      uid: file.uid,
      name: file.name,
      status: "done",
      url: file.response?.url || file.url,
    }));
  };

  // Upload file lên Cloudinary
  const uploadToCloudinary = async ({ file, onSuccess, onError }) => {
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch("http://localhost:3001/api/upload-image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      onSuccess(data, file);
    } catch (err) {
      onError(err);
    }
  };
  const openEditModal = (event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
    form.setFieldsValue({
      title: event.title,
      organizerEmail: event.organizerEmail,
      organizerName: event.organizerName,
      description: event.description,
      buyerMessage: event.buyerMessage,
      organizerInfo: event.organizerInfo,
      categoryId: event.categoryId,

      // ---- DATE / TIME ----
      eventDate: event.eventDate ? dayjs(event.eventDate) : null,
      eventStartTime: event.eventStartTime ? dayjs(event.eventStartTime) : null,
      eventEndTime: event.eventEndTime ? dayjs(event.eventEndTime) : null,

      // ---- UPLOAD LOGO ----
      organizerLogoUrl: event.organizerLogoUrl
        ? [
            {
              uid: "-1",
              name: "logo.png",
              status: "done",
              url: event.organizerLogoUrl,
            },
          ]
        : [],

      organizerBannerUrl: event.organizerBannerUrl
        ? [
            {
              uid: "-2",
              name: "banner.png",
              status: "done",
              url: event.organizerBannerUrl,
            },
          ]
        : [],
    });
  };
  const onFinish = async (values) => {
    if (!currentUser) {
      return Modal.error({
        title: "Lỗi",
        content: "Bạn chưa đăng nhập, không thể tạo sự kiện",
      });
    }

    try {
      const payload = {
        ...values,
        description,
        organizerId: currentUser.id,
        organizerEmail: currentUser.email,
        status: "Pending",
        organizerLogoUrl: values.organizerLogoUrl?.[0]?.url || "",
        organizerBannerUrl: values.organizerBannerUrl?.[0]?.url || "",
        eventDate: values.eventDate?.format("YYYY-MM-DD"),
        eventStartTime: values.eventStartTime
          ? dayjs(values.eventStartTime).toDate()
          : null,
        eventEndTime: values.eventEndTime
          ? dayjs(values.eventEndTime).toDate()
          : null,
      };

      if (editingEvent) {
        // --- UPDATE ---
        await axiosJWT.put(
          `http://localhost:3001/api/event/update/${editingEvent._id}`,
          payload
        );
        setEditingEvent(null);
      } else {
        // --- CREATE ---
        await axiosJWT.post("http://localhost:3001/api/event/create", payload);
      }

      setIsModalOpen(false);
      form.resetFields();
      setDescription("");
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };
  const items = [
    {
      key: "1",
      label: "My Account",
      disabled: true,
    },
    {
      type: "divider",
    },
    {
      key: "2",
      label: "Profile",
      extra: "⌘P",
    },
    {
      key: "3",
      label: "Billing",
      extra: "⌘B",
    },
    {
      key: "4",
      label: "Settings",
      extra: "⌘S",
    },
  ];
  const handleDeleteAll = () => {};
  return (
    <LoadingComponent isLoading={isLoading}>
      <div>
        <WrapperHeader>Quản lý Event</WrapperHeader>

        <Button
          onClick={openCreateModal}
          style={{
            height: 150,
            width: 150,
            borderRadius: 6,
            borderStyle: "dashed",
            marginTop: 10,
          }}
        >
          <PlusOutlined style={{ fontSize: 60 }} />
        </Button>
        {selectedRowKeys.length > 0 && (
          <div
            style={{
              background: "#1d1ddd",
              color: "#fff",
              fontWeight: "bold",
              padding: "10px",
              marginTop: "10px",
            }}
            onClick={handleDeleteAll}
          >
            <Dropdown menu={{ items }}>
              <a onClick={(e) => e.preventDefault()}>
                <Space style={{ color: "#fff" }}>
                  Xóa tất cả
                  <DownOutlined />
                </Space>
              </a>
            </Dropdown>
          </div>
        )}
        <div style={{ marginTop: 20 }}>
          <TableComponent
            data={events}
            columns={eventColumns}
            total={totalEvents}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={(page) => setCurrentPage(page)}
            rowSelection={{
              selectedRowKeys,
              onChange: (newSelectedKeys) => {
                setSelectedRowKeys(newSelectedKeys);
              },
            }}
          />
        </div>

        <Modal
          title="Thêm Event"
          centered
          open={IsModalOpen}
          onCancel={() => setIsModalOpen(false)}
          width={1000}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            style={{ maxWidth: 700, margin: "0 auto", marginTop: 24 }}
          >
            {/* Tên đơn vị */}
            <Form.Item
              label="Tên đơn vị tổ chức"
              name="organizerName"
              rules={[{ required: true, message: "Vui lòng nhập tên tổ chức" }]}
            >
              <InputComponent placeholder="VD: HUTECH Event Organization" />
            </Form.Item>

            {/* Email */}
            <Form.Item
              label="Email đơn vị tổ chức"
              name="organizerEmail"
              rules={[
                { required: true, message: "Vui lòng nhập email" },
                { type: "email", message: "Email không hợp lệ" },
              ]}
            >
              <InputComponent />
            </Form.Item>

            {/* Thông tin */}
            <Form.Item label="Thông tin đơn vị tổ chức" name="organizerInfo">
              <TextArea rows={3} placeholder="Mô tả ngắn" />
            </Form.Item>

            {/* Logo */}
            <Form.Item
              label="Logo tổ chức"
              name="organizerLogoUrl"
              valuePropName="fileList"
              getValueFromEvent={normFile}
            >
              <Upload
                listType="picture-card"
                customRequest={uploadToCloudinary}
              >
                <div>
                  <PlusOutlined />
                  <div>Tải lên</div>
                </div>
              </Upload>
            </Form.Item>

            {/* Banner */}
            <Form.Item
              label="Banner tổ chức"
              name="organizerBannerUrl"
              valuePropName="fileList"
              getValueFromEvent={normFile}
            >
              <Upload
                listType="picture-card"
                customRequest={uploadToCloudinary}
              >
                <div>
                  <PlusOutlined />
                  <div>Tải lên</div>
                </div>
              </Upload>
            </Form.Item>

            {/* Tên sự kiện */}
            <Form.Item
              label="Tên sự kiện"
              name="title"
              rules={[{ required: true, message: "Vui lòng nhập tên sự kiện" }]}
            >
              <InputComponent />
            </Form.Item>

            {/* Mô tả sự kiện */}
            <Form.Item
              label="Mô tả sự kiện"
              name="description"
              rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
              getValueFromEvent={() => description}
            >
              <RichTextEditor value={description} onChange={setDescription} />
            </Form.Item>

            {/* Category */}
            <Form.Item
              label="Danh mục sự kiện"
              name="categoryId"
              rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
            >
              <Select placeholder="Chọn danh mục">
                <Select.Option value="665177a87f5f5a8782321dd1">
                  Âm nhạc
                </Select.Option>
                <Select.Option value="665177be7f5f5a8782321dd2">
                  Hội nghị
                </Select.Option>
                <Select.Option value="665177d07f5f5a8782321dd3">
                  Thể thao
                </Select.Option>
              </Select>
            </Form.Item>

            {/* Date & Time */}
            <Form.Item
              label="Ngày tổ chức"
              name="eventDate"
              rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              label="Giờ bắt đầu"
              name="eventStartTime"
              rules={[{ required: true, message: "Vui lòng chọn giờ bắt đầu" }]}
            >
              <TimePicker style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              label="Giờ kết thúc"
              name="eventEndTime"
              rules={[
                { required: true, message: "Vui lòng chọn giờ kết thúc" },
              ]}
            >
              <TimePicker style={{ width: "100%" }} />
            </Form.Item>

            {/* Buyer message */}
            <Form.Item label="Tin nhắn gửi người mua" name="buyerMessage">
              <InputComponent />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                {editingEvent ? "Cập nhật" : "Tạo sự kiện"}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </LoadingComponent>
  );
};

export default AdminEvent;

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
  Input,
  message,
} from "antd";
import {
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
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
import { useNavigate } from "react-router-dom";

const renderTicketFormList = () => (
  <Form.List name="tickets">
    {(fields, { add, remove }) => (
      <>
        {fields.map(({ key, name, ...restField }) => (
          <Space
            key={key}
            style={{
              display: "flex",
              marginBottom: 10,
              padding: 10,
              border: "1px dashed #f0f0f0",
            }}
            align="start"
            wrap
          >
            <Form.Item
              {...restField}
              name={[name, "type"]}
              rules={[{ required: true, message: "Loại vé" }]}
              style={{ width: 120 }}
            >
              <Input placeholder="Tên vé (VIP, Gen)" />
            </Form.Item>
            <Form.Item
              {...restField}
              name={[name, "price"]}
              rules={[{ required: true, message: "Giá" }]}
            >
              <InputComponent
                type="number"
                placeholder="Giá"
                style={{ width: 100 }}
              />
            </Form.Item>
            <Form.Item
              {...restField}
              name={[name, "quantity"]}
              rules={[{ required: true, message: "Số lượng" }]}
            >
              <InputComponent
                type="number"
                placeholder="SL"
                style={{ width: 80 }}
              />
            </Form.Item>
            <Form.Item
              {...restField}
              name={[name, "startDate"]}
              rules={[{ required: true, message: "Ngày mở bán" }]}
            >
              <DatePicker placeholder="Diễn ra từ" style={{ width: 120 }} />
            </Form.Item>
            <Form.Item
              {...restField}
              name={[name, "endDate"]}
              rules={[{ required: true, message: "Kết thúc vào" }]}
            >
              <DatePicker placeholder="Kết thúc từ" style={{ width: 120 }} />
            </Form.Item>
            <Form.Item
              {...restField}
              name={[name, "description"]}
              style={{ width: 400 }}
            >
              <RichTextEditor placeholder="Mô tả chi tiết vé (Gói Ưu tiên, Đã bao gồm thức uống...)" />
            </Form.Item>
            <DeleteOutlined
              onClick={() => remove(name)}
              style={{ color: "red", fontSize: 20, paddingTop: 8 }}
            />
          </Space>
        ))}
        <Form.Item>
          <Button
            type="dashed"
            onClick={() => add({ currency: "VND", status: "Available" })}
            block
            icon={<PlusOutlined />}
          >
            Thêm loại vé
          </Button>
        </Form.Item>
      </>
    )}
  </Form.List>
);

const renderLocationFormList = () => (
  <Form.List name="locations">
    {(fields, { add, remove }) => (
      <>
        {fields.map(({ key, name, ...restField }) => (
          <Space
            key={key}
            style={{
              display: "flex",
              marginBottom: 10,
              padding: 10,
              border: "1px dashed #f0f0f0",
            }}
            align="start"
            wrap
          >
            <Form.Item
              {...restField}
              name={[name, "name"]}
              rules={[{ required: true }]}
              style={{ width: 150 }}
            >
              <Input placeholder="Tên địa điểm" />
            </Form.Item>
            <Form.Item
              {...restField}
              name={[name, "address"]}
              rules={[{ required: true }]}
              style={{ flexGrow: 1 }}
            >
              <Input placeholder="Địa chỉ chi tiết" />
            </Form.Item>
            <Form.Item
              {...restField}
              name={[name, "city"]}
              rules={[{ required: true }]}
              style={{ width: 100 }}
            >
              <Input placeholder="Thành phố" />
            </Form.Item>
            <Form.Item
              {...restField}
              name={[name, "district"]}
              rules={[{ required: true }]}
              style={{ width: 100 }}
            >
              <Input placeholder="Quận/Huyện" />
            </Form.Item>
            <DeleteOutlined
              onClick={() => remove(name)}
              style={{ color: "red", fontSize: 20, paddingTop: 8 }}
            />
          </Space>
        ))}
        <Form.Item>
          <Button
            type="dashed"
            onClick={() => add({ capacity: 0 })}
            block
            icon={<PlusOutlined />}
          >
            Thêm địa điểm
          </Button>
        </Form.Item>
      </>
    )}
  </Form.List>
);

const UserEvent = () => {
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
  const navigate = useNavigate();
  const handleViewEvent = (eventId) => {
    navigate(`/event/${eventId}/orders`);
  };
  useEffect(() => {
    fetchEvents();
  }, []);

  const openCreateModal = () => {
    setEditingEvent(null);
    form.resetFields();
    setDescription("");
    setIsModalOpen(true);
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
    { title: "Trạng thái", dataIndex: "status", key: "status" },
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

          <Button
            style={{ backgroundColor: "#fff", border: "none" }}
            type="default"
            onClick={() => handleViewEvent(record._id)}
          >
            <EyeOutlined style={{ color: "green", fontSize: "30px" }} />
          </Button>
        </div>
      ),
    },
  ];

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await axiosJWT.get(
        `http://localhost:3001/api/event/get-by-organizer/${currentUser.id}`
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
      setAllEvents(res.data.data);
      setEvents(res.data.data);
      setTotalEvents(res.data.total);
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
      message.success("Xóa sự kiện thành công!");
      fetchEvents();
    } catch (err) {
      console.log(err);
      message.error("Lỗi khi xóa sự kiện.");
    }
  };

  const normFile = (e) => {
    if (!e) return [];
    return e.fileList.map((file) => ({
      uid: file.uid,
      name: file.name,
      status: "done",
      url: file.response?.url || file.url,
    }));
  };

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

  // TRONG UserEvent.jsx

  const openEditModal = (event) => {
    setEditingEvent(event);
    setIsModalOpen(true);

    // Lấy ảnh chính (Primary Image) từ mảng eventImages
    const primaryImage = event.eventImages?.find((img) => img.isPrimary);

    // Đặt giá trị cho Form
    form.setFieldsValue({
      // 1. Các trường Event chính
      title: event.title,
      organizerEmail: event.organizerEmail,
      organizerName: event.organizerName,
      buyerMessage: event.buyerMessage,
      organizerInfo: event.organizerInfo,
      categoryId: event.categoryId,
      description: event.description || "",
      // Chuyển đổi Ngày/Giờ thành dayjs object
      eventDate: event.eventDate ? dayjs(event.eventDate) : null,
      eventEndDate: event.eventEndDate ? dayjs(event.eventEndDate) : null,
      eventStartTime: event.eventStartTime ? dayjs(event.eventStartTime) : null,
      eventEndTime: event.eventEndTime ? dayjs(event.eventEndTime) : null,

      // 2. Ảnh Logo & Banner (Định dạng fileList)
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

      tickets:
        event.tickets?.length > 0
          ? event.tickets.map((t) => ({
              ...t,
              startDate: t.startDate ? dayjs(t.startDate) : null,
              endDate: t.endDate ? dayjs(t.endDate) : null,
            }))
          : [{}],

      // 4. Locations (Form.List)
      locations: event.locations?.length > 0 ? event.locations : [{}],
      primaryEventImage: primaryImage
        ? [
            {
              uid: primaryImage._id || "-3",
              name: "primary.png",
              status: "done",
              url: primaryImage.imageUrl,
            },
          ]
        : [],

      // 5. RedInvoice (Đối tượng lồng nhau)
      redInvoice: event.redInvoice || { businessType: "Cá nhân" },

      // 6. Primary Event Image (Định dạng fileList)
      primaryEventImage: primaryImage?.imageUrl
        ? [
            {
              uid: primaryImage._id || "-3",
              name: "primary.png",
              status: "done",
              url: primaryImage.imageUrl,
            },
          ]
        : [],
    });

    // Gán giá trị cho RichTextEditor (separate state)
    setDescription(event.description || "");
  };

  const onFinish = async (values) => {
    if (!currentUser || !currentUser.id) {
      return Modal.error({
        title: "Lỗi",
        content: "Bạn chưa đăng nhập, không thể thao tác",
      });
    }

    if (editingEvent) {
      // --- XỬ LÝ UPDATE (Bao gồm cả các mảng lồng nhau) ---
      try {
        // 1. Chuẩn bị dữ liệu cho Event chính
        const eventCorePayload = {
          title: values.title,
          description: description,
          buyerMessage: values.buyerMessage,
          categoryId: values.categoryId,
          organizerEmail: values.organizerEmail,
          organizerName: values.organizerName,
          organizerInfo: values.organizerInfo,
          organizerLogoUrl: values.organizerLogoUrl?.[0]?.url || "",
          organizerBannerUrl: values.organizerBannerUrl?.[0]?.url || "",
          eventDate: values.eventDate?.format("YYYY-MM-DD"),
          eventEndDate: values.eventEndDate?.format("YYYY-MM-DD"),
          eventStartTime: values.eventStartTime?.toISOString(),
          eventEndTime: values.eventEndTime?.toISOString(),
        };

        // 2. Chuẩn bị dữ liệu cho Tickets (Định dạng lại ngày tháng)
        const ticketsPayload = values.tickets.map((t) => ({
          ...t,
          startDate: t.startDate ? t.startDate.toISOString() : null,
          endDate: t.endDate ? t.endDate.toISOString() : null,
        }));

        // 3. Chuẩn bị dữ liệu cho Event Images
        const primaryImage = values.primaryEventImage?.[0]?.url;
        const eventImagesPayload = primaryImage
          ? [
              {
                imageUrl: primaryImage,
                isPrimary: true,
                // Nếu là update, cần giữ lại _id của ảnh cũ nếu tồn tại
                _id:
                  values.primaryEventImage?.[0]?.uid === "-3"
                    ? editingEvent.eventImages?.find((img) => img.isPrimary)
                        ?._id
                    : undefined,
              },
            ]
          : [];

        // 4. Kết hợp tất cả thành payload cuối cùng
        const finalPayload = {
          ...eventCorePayload,
          tickets: ticketsPayload,
          locations: values.locations,
          redInvoice: values.redInvoice,
          eventImages: eventImagesPayload,
        };

        // Gửi yêu cầu PUT đến API
        await axiosJWT.put(
          `http://localhost:3001/api/event/update/${editingEvent._id}`,
          finalPayload // 👈 Payload ĐẦY ĐỦ
        );

        setEditingEvent(null);
        message.success("Cập nhật sự kiện thành công!");
      } catch (err) {
        console.error("Lỗi cập nhật:", err.response?.data || err);
        message.error(
          `Lỗi cập nhật: ${err.response?.data?.message || "Lỗi server"}`
        );
      }
    } else {
      // --- XỬ LÝ TẠO EVENT (CREATE) VỚI 5 ĐỐI TƯỢNG ---
      try {
        const eventPayload = {
          title: values.title,
          description: description,
          buyerMessage: values.buyerMessage,
          categoryId: values.categoryId,

          organizerId: currentUser.id,
          organizerEmail: values.organizerEmail,
          organizerName: values.organizerName,
          organizerInfo: values.organizerInfo,
          organizerLogoUrl: values.organizerLogoUrl?.[0]?.url || "",
          organizerBannerUrl: values.organizerBannerUrl?.[0]?.url || "",
          status: "Pending",

          eventDate: values.eventDate?.format("YYYY-MM-DD"),
          eventEndDate: values.eventEndDate?.format("YYYY-MM-DD"),
          eventStartTime: dayjs(
            `${values.eventDate?.format(
              "YYYY-MM-DD"
            )} ${values.eventStartTime?.format("HH:mm:ss")}`
          ).toISOString(),
          eventEndTime: dayjs(
            `${values.eventDate?.format(
              "YYYY-MM-DD"
            )} ${values.eventEndTime?.format("HH:mm:ss")}`
          ).toISOString(),
        };

        const finalPayload = {
          event: eventPayload,
          tickets: values.tickets.map((t) => ({
            ...t,
            startDate: t.startDate?.toISOString(),
            endDate: t.endDate?.toISOString(),
          })),
          locations: values.locations,

          eventImages: [
            {
              imageUrl: values.primaryEventImage?.[0]?.url || "",
              isPrimary: true,
            },
          ].filter((img) => img.imageUrl),

          redInvoice: values.redInvoice,
        };

        await axiosJWT.post(
          "http://localhost:3001/api/event/create",
          finalPayload
        );
        message.success(
          "Sự kiện và các tài nguyên đã được tạo thành công! Đang chờ duyệt."
        );
      } catch (err) {
        console.error("Lỗi tạo sự kiện:", err.response?.data || err);
        return Modal.error({
          title: "Lỗi tạo sự kiện",
          content: err.response?.data?.message || "Đã xảy ra lỗi server.",
        });
      }
    }

    setIsModalOpen(false);
    form.resetFields();
    setDescription("");
    fetchEvents();
  };

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
            <Dropdown menu={{ items: [] }}>
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
          title={editingEvent ? "Cập nhật Event" : "Thêm Event Mới"}
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
            style={{ margin: "0 auto", marginTop: 24 }}
            initialValues={{
              tickets: [{}],
              locations: [{}],
              redInvoice: { businessType: "Cá nhân" },
            }}
          >
            <h3
              style={{
                borderBottom: "1px solid #ddd",
                paddingBottom: 5,
                marginBottom: 15,
              }}
            >
              1. Thông tin Event & Tổ chức
            </h3>

            <Form.Item
              label="Tên đơn vị tổ chức"
              name="organizerName"
              rules={[{ required: true, message: "Vui lòng nhập tên tổ chức" }]}
            >
              <InputComponent placeholder="VD: HUTECH Event Organization" />
            </Form.Item>

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

            <Form.Item label="Thông tin đơn vị tổ chức" name="organizerInfo">
              <TextArea rows={3} placeholder="Mô tả ngắn" />
            </Form.Item>

            <Form.Item
              label="Logo tổ chức"
              name="organizerLogoUrl"
              valuePropName="fileList"
              getValueFromEvent={normFile}
            >
              <Upload
                listType="picture-card"
                customRequest={uploadToCloudinary}
                maxCount={1}
              >
                <div>
                  <PlusOutlined />
                  <div>Tải lên Logo</div>
                </div>
              </Upload>
            </Form.Item>

            <Form.Item
              label="Banner tổ chức"
              name="organizerBannerUrl"
              valuePropName="fileList"
              getValueFromEvent={normFile}
            >
              <Upload
                listType="picture-card"
                customRequest={uploadToCloudinary}
                maxCount={1}
              >
                <div>
                  <PlusOutlined />
                  <div>Tải lên Banner</div>
                </div>
              </Upload>
            </Form.Item>

            <Form.Item
              label="Tên sự kiện"
              name="title"
              rules={[{ required: true, message: "Vui lòng nhập tên sự kiện" }]}
            >
              <InputComponent />
            </Form.Item>

            <Form.Item
              label="Mô tả sự kiện"
              rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
            >
              <RichTextEditor value={description} onChange={setDescription} />
            </Form.Item>

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
                  Hội thảo / Workshop
                </Select.Option>

                <Select.Option value="665177d07f5f5a8782321dd3">
                  Kịch
                </Select.Option>

                <Select.Option value="665177e27f5f5a8782321dd4">
                  Hội nghị (Conference)
                </Select.Option>

                <Select.Option value="665177f87f5f5a8782321dd5">
                  Gặp gỡ / Meetup
                </Select.Option>

                <Select.Option value="6651780c7f5f5a8782321dd6">
                  Lễ hội / Festival
                </Select.Option>

                <Select.Option value="665178227f5f5a8782321dd7">
                  Thể thao
                </Select.Option>

                <Select.Option value="6651783a7f5f5a8782321dd8">
                  Giáo dục
                </Select.Option>

                <Select.Option value="6651784f7f5f5a8782321dd9">
                  Công nghệ
                </Select.Option>
              </Select>
            </Form.Item>

            <Space size="large" style={{ display: "flex" }}>
              <Form.Item
                label="Ngày tổ chức"
                name="eventDate"
                rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                label="Ngày kết thúc"
                name="eventEndDate"
                rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                label="Giờ bắt đầu"
                name="eventStartTime"
                rules={[
                  { required: true, message: "Vui lòng chọn giờ bắt đầu" },
                ]}
              >
                <TimePicker format="HH:mm" style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                label="Giờ kết thúc"
                name="eventEndTime"
                rules={[
                  { required: true, message: "Vui lòng chọn giờ kết thúc" },
                ]}
              >
                <TimePicker format="HH:mm" style={{ width: "100%" }} />
              </Form.Item>
            </Space>

            <Form.Item label="Tin nhắn gửi người mua" name="buyerMessage">
              <InputComponent />
            </Form.Item>

            <h3
              style={{
                borderBottom: "1px solid #ddd",
                paddingBottom: 5,
                marginTop: 30,
                marginBottom: 15,
              }}
            >
              2. Thông tin Vé sự kiện
            </h3>
            {renderTicketFormList()}

            <h3
              style={{
                borderBottom: "1px solid #ddd",
                paddingBottom: 5,
                marginTop: 30,
                marginBottom: 15,
              }}
            >
              3. Địa điểm tổ chức
            </h3>
            {renderLocationFormList()}

            <h3
              style={{
                borderBottom: "1px solid #ddd",
                paddingBottom: 5,
                marginTop: 30,
                marginBottom: 15,
              }}
            >
              4. Ảnh chính & Hóa đơn VAT
            </h3>

            <Form.Item
              label="Ảnh đại diện chính Sự kiện"
              name="primaryEventImage"
              valuePropName="fileList"
              getValueFromEvent={normFile}
              rules={[
                { required: true, message: "Vui lòng tải lên ảnh chính" },
              ]}
            >
              <Upload
                listType="picture-card"
                customRequest={uploadToCloudinary}
                maxCount={1}
              >
                <div>
                  <PlusOutlined />
                  <div>Ảnh chính</div>
                </div>
              </Upload>
            </Form.Item>

            <div
              style={{ border: "1px dashed #ccc", padding: 20, marginTop: 20 }}
            >
              <h4>🧾 Thông tin xuất Hóa đơn Đỏ (VAT)</h4>
              <Form.Item
                name={["redInvoice", "businessType"]}
                label="Loại hình doanh nghiệp"
                rules={[{ required: true }]}
              >
                <Select placeholder="Chọn loại hình">
                  <Select.Option value="Cá nhân">Cá nhân</Select.Option>
                  <Select.Option value="Tổ chức/Doanh nghiệp">
                    Tổ chức/Doanh nghiệp
                  </Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                name={["redInvoice", "fullName"]}
                label="Tên (Cá nhân/Công ty)"
                rules={[{ required: true }]}
              >
                <InputComponent />
              </Form.Item>
              <Form.Item
                name={["redInvoice", "taxCode"]}
                label="Mã số thuế"
                rules={[{ required: true }]}
              >
                <InputComponent />
              </Form.Item>
              <Form.Item
                name={["redInvoice", "address"]}
                label="Địa chỉ"
                rules={[{ required: true }]}
              >
                <TextArea rows={2} />
              </Form.Item>
            </div>

            <Form.Item style={{ marginTop: 30 }}>
              <Button type="primary" htmlType="submit">
                {editingEvent ? "Cập nhật Event" : "Tạo Sự kiện (Gửi yêu cầu)"}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </LoadingComponent>
  );
};

export default UserEvent;

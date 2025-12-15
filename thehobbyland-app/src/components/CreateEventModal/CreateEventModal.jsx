import React, { useState } from "react";
import {
  Button,
  Form,
  Modal,
  Input,
  DatePicker,
  TimePicker,
  Select,
  Upload,
  Space,
  message,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import RichTextEditor from "./RichTextEditor/RichTextEditor"; // Giả định
import InputComponent from "./InputComponent/InputComponent"; // Giả định
import { useSelector } from "react-redux";
import { axiosJWT } from "../../services/UserService";
import dayjs from "dayjs";

const { TextArea } = Input;

// --- HÀM HỖ TRỢ UPLOAD & NORM FILE (Giữ nguyên từ code cũ) ---
const uploadToCloudinary = async ({ file, onSuccess, onError }) => {
  // ... (Giữ nguyên logic upload)
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

const normFile = (e) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList.map((file) => ({
    uid: file.uid,
    name: file.name,
    status: "done",
    url: file.response?.url || file.url,
  }));
};
// -----------------------------------------------------------

const CreateEventModal = ({ isModalOpen, setIsModalOpen, fetchEvents }) => {
  const [form] = Form.useForm();
  const [description, setDescription] = useState("");
  const currentUser = useSelector((state) => state.user); // Thông tin User đang đăng nhập

  // Tạm thời hiển thị tất cả các bước cùng lúc, sử dụng Section Headings để phân chia
  // Nếu bạn muốn dùng Steps, bạn sẽ cần state 'currentStep' và logic Next/Prev.

  const onFinish = async (values) => {
    if (!currentUser || !currentUser.id) {
      message.error("Vui lòng đăng nhập để tạo sự kiện!");
      return;
    }

    // 1. CHUẨN BỊ EVENT DATA
    const eventPayload = {
      title: values.title,
      description: description,
      buyerMessage: values.buyerMessage,
      categoryId: values.categoryId,

      // Lấy thông tin Organizer từ User đang đăng nhập (hoặc từ form nếu Admin cho phép nhập thay)
      organizerId: currentUser.id,
      organizerEmail: currentUser.email,
      organizerName: values.organizerName,
      organizerInfo: values.organizerInfo,
      organizerLogoUrl: values.organizerLogoUrl?.[0]?.url || "",
      organizerBannerUrl: values.organizerBannerUrl?.[0]?.url || "",
      status: "Pending",

      // Date & Time Formatting: kết hợp Date Picker và Time Picker
      eventDate: values.eventDate?.format("YYYY-MM-DD"),
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

    // 2. CHUẨN BỊ PAYLOAD CUỐI CÙNG CHO BACKEND (5 đối tượng)
    const finalPayload = {
      event: eventPayload,
      tickets: values.tickets,
      locations: values.locations,

      eventImages: [
        {
          imageUrl: values.primaryEventImage?.[0]?.url || "",
          isPrimary: true,
        },
      ].filter((img) => img.imageUrl),

      redInvoice: values.redInvoice, // Đối tượng RedInvoice được nhập thẳng vào form
    };

    try {
      await axiosJWT.post(
        "http://localhost:3001/api/event/create",
        finalPayload
      );
      message.success("Sự kiện đã được tạo thành công và đang chờ duyệt!");

      // Đóng Modal và Reset
      setIsModalOpen(false);
      form.resetFields();
      setDescription("");
      if (fetchEvents) {
        fetchEvents(); // Tải lại danh sách nếu có
      }
    } catch (err) {
      console.error("Lỗi tạo sự kiện:", err.response?.data || err);
      message.error(
        `Lỗi tạo sự kiện: ${err.response?.data?.message || "Lỗi server"}`
      );
    }
  };

  // Hàm đóng Modal
  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields(); // Đảm bảo reset khi hủy
    setDescription("");
  };

  return (
    <Modal
      title="✨ Tạo Sự kiện Mới"
      centered
      open={isModalOpen}
      onCancel={handleCancel}
      width={1000}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          // Set giá trị mặc định cho RedInvoice để Form không bị báo lỗi thiếu trường
          redInvoice: { businessType: "Cá nhân" },
          tickets: [{}],
          locations: [{}],
        }}
      >
        {/* ------------------------------------------------------------------ */}
        {/* PHẦN 1: EVENT CHÍNH                    */}
        {/* ------------------------------------------------------------------ */}
        <h3
          style={{
            borderBottom: "1px solid #eee",
            paddingBottom: 5,
            marginBottom: 15,
          }}
        >
          📝 Thông tin Sự kiện & Ban tổ chức
        </h3>

        <Form.Item
          label="Tên sự kiện"
          name="title"
          rules={[{ required: true, message: "Vui lòng nhập tên sự kiện" }]}
        >
          <InputComponent />
        </Form.Item>

        <Form.Item
          label="Danh mục sự kiện"
          name="categoryId"
          rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
        >
          <Select placeholder="Chọn danh mục">
            {/* Cần gọi API để lấy danh sách Category động */}
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

        <Space size="large" style={{ display: "flex" }}>
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
            <TimePicker format="HH:mm" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="Giờ kết thúc"
            name="eventEndTime"
            rules={[{ required: true, message: "Vui lòng chọn giờ kết thúc" }]}
          >
            <TimePicker format="HH:mm" style={{ width: "100%" }} />
          </Form.Item>
        </Space>

        <Form.Item
          label="Mô tả sự kiện"
          name="description"
          rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          getValueFromEvent={() => description}
        >
          <RichTextEditor value={description} onChange={setDescription} />
        </Form.Item>

        {/* Organizer Info - Cần thiết vì có thể Organizer Name khác User Name */}
        <Form.Item
          label="Tên đơn vị tổ chức"
          name="organizerName"
          rules={[{ required: true, message: "Vui lòng nhập tên tổ chức" }]}
        >
          <InputComponent placeholder="VD: Công ty TNHH Sự kiện XYZ" />
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
              <div>Logo</div>
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
              <div>Banner</div>
            </div>
          </Upload>
        </Form.Item>

        {/* ------------------------------------------------------------------ */}
        {/* PHẦN 2: TICKETS (Vé)                   */}
        {/* ------------------------------------------------------------------ */}
        <h3
          style={{
            borderBottom: "1px solid #eee",
            paddingBottom: 5,
            marginTop: 30,
            marginBottom: 15,
          }}
        >
          🎫 Thông tin Vé sự kiện
        </h3>
        {renderTicketFormList()}

        {/* ------------------------------------------------------------------ */}
        {/* PHẦN 3: LOCATION (Địa điểm)            */}
        {/* ------------------------------------------------------------------ */}
        <h3
          style={{
            borderBottom: "1px solid #eee",
            paddingBottom: 5,
            marginTop: 30,
            marginBottom: 15,
          }}
        >
          📍 Địa điểm tổ chức
        </h3>
        {renderLocationFormList()}

        {/* ------------------------------------------------------------------ */}
        {/* PHẦN 4: IMAGES & RED INVOICE           */}
        {/* ------------------------------------------------------------------ */}
        <h3
          style={{
            borderBottom: "1px solid #eee",
            paddingBottom: 5,
            marginTop: 30,
            marginBottom: 15,
          }}
        >
          📷 Ảnh chính & Hóa đơn VAT
        </h3>

        <Form.Item
          label="Ảnh đại diện chính Sự kiện"
          name="primaryEventImage"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          rules={[{ required: true, message: "Vui lòng tải lên ảnh chính" }]}
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

        <div style={{ border: "1px dashed #ccc", padding: 20, marginTop: 20 }}>
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

        {/* ------------------------------------------------------------------ */}
        {/* NÚT SUBMIT                             */}
        {/* ------------------------------------------------------------------ */}
        <Form.Item style={{ marginTop: 30 }}>
          <Button type="primary" htmlType="submit" block size="large">
            Gửi Sự kiện & Tài nguyên (Chờ duyệt)
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateEventModal;

// --------------------------------------------------------------------------
//                  HÀM RENDER RIÊNG CHO FORM.LIST
// --------------------------------------------------------------------------

// Giúp Form.List quản lý mảng Tickets
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
              rules={[{ required: true, message: "Ngày kết thúc" }]}
            >
              <DatePicker placeholder="Kết thúc từ" style={{ width: 120 }} />
            </Form.Item>
            <Form.Item {...restField} name={[name, "description"]}>
              <InputComponent
                placeholder="Mô tả vé (optional)"
                style={{ width: 150 }}
              />
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
            onClick={() => add({ currency: "VND", trangThai: "ConVe" })}
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

// Giúp Form.List quản lý mảng Locations
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
              <Input placeholder="Tên địa điểm (Sân Vận Động, Nhà Hát)" />
            </Form.Item>
            <Form.Item
              {...restField}
              name={[name, "address"]}
              rules={[{ required: true }]}
              style={{ flexGrow: 1 }}
            >
              <Input placeholder="Địa chỉ chi tiết (Đường/Số nhà)" />
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
            <Form.Item
              {...restField}
              name={[name, "ward"]}
              rules={[{ required: true }]}
              style={{ width: 100 }}
            >
              <Input placeholder="Phường/Xã" />
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

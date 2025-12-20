import React, { useEffect, useState } from "react";
import { Table, Tag, Select, DatePicker, Space, Card } from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { axiosJWT } from "../../services/UserService";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const { RangePicker } = DatePicker;

const WalletHistoryPage = () => {
  const [data, setData] = useState([]);
  const user = useSelector((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [dateRange, setDateRange] = useState([]);

  const token = localStorage.getItem("access_token");

  const fetchData = async () => {
    if (user?.id) {
      try {
        const res = await axios.get(
          `http://localhost:3001/wallet/history/${user.id}`
        );
        setData(res?.data?.data || []);
      } catch (err) {
        console.error("Lỗi lấy lịch sử ví:", err);
      } finally {
        setIsLoading(false); // Xong dữ liệu
      }
    } else {
      // Nếu sau khi load mà vẫn ko có user id (ví dụ chưa đăng nhập thực sự)
      // setIsLoading(false) sau 1 khoảng delay nhỏ để chắc chắn Redux đã thử load
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);
  if (isLoading && !user?.id) {
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        Đang xác thực tài khoản...
      </div>
    );
  }
  const filteredData = data.filter((item) => {
    const matchType = typeFilter ? item.type === typeFilter : true;
    const matchDate =
      dateRange.length === 2
        ? dayjs(item.createdAt).isSameOrAfter(dateRange[0], "day") &&
          dayjs(item.createdAt).isSameOrBefore(dateRange[1], "day")
        : true;

    return matchType && matchDate;
  });

  const columns = [
    {
      title: "Loại",
      dataIndex: "type",
      render: (t) =>
        t === "NAP" ? (
          <Tag color="green">Nạp tiền</Tag>
        ) : (
          <Tag color="red">Rút tiền</Tag>
        ),
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      render: (v) => (
        <span style={{ fontWeight: 600 }}>{v.toLocaleString("vi-VN")} đ</span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (s) => {
        if (s === "SUCCESS") return <Tag color="green">Thành công</Tag>;
        if (s === "PENDING") return <Tag color="orange">Đang xử lý</Tag>;
        return <Tag color="red">Thất bại</Tag>;
      },
    },
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      render: (t) => dayjs(t).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Ghi chú",
      dataIndex: "description",
    },
  ];

  return (
    <Card title="📜 Lịch sử giao dịch ví">
      <Space style={{ marginBottom: 16 }}>
        <Select
          allowClear
          placeholder="Loại giao dịch"
          style={{ width: 160 }}
          onChange={(v) => setTypeFilter(v)}
          options={[
            { value: "NAP", label: "Nạp tiền" },
            { value: "RUT", label: "Rút tiền" },
          ]}
        />
        <RangePicker onChange={(v) => setDateRange(v || [])} />
      </Space>

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={filteredData}
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
};

export default WalletHistoryPage;

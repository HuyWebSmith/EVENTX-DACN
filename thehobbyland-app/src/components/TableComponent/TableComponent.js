import React from "react";
import { Table, Button, Image, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
const TableComponent = ({
  data = [],
  columns, // nhận columns từ ngoài
  total = 0,
  pageSize = 10,
  currentPage = 1,
  onPageChange,
  onEdit,
  onDelete,
  rowSelection,
}) => {
  // Nếu không truyền columns thì dùng mặc định (cho Event)
  const defaultColumns = [
    { title: "Tên sự kiện", dataIndex: "title", key: "title" },
    { title: "Ngày tổ chức", dataIndex: "eventDate", key: "eventDate" },
    { title: "Trạng thái", dataIndex: "status", key: "status" },
    {
      title: "Người tổ chức",
      dataIndex: "organizerName",
      key: "organizerName",
    },
    {
      title: "Logo",
      dataIndex: "organizerLogoUrl",
      key: "logo",
      render: (url) =>
        url && (
          <Image
            width={50}
            height={50}
            src={url}
            style={{ borderRadius: 8, objectFit: "contain" }}
          />
        ),
      align: "center",
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Button type="primary" onClick={() => onEdit?.(record)}>
            <EditOutlined />
          </Button>
          <Popconfirm
            title="Xóa sự kiện này?"
            onConfirm={() => onDelete?.(record)}
          >
            <DeleteOutlined />
          </Popconfirm>
        </div>
      ),
    },
  ];
  return (
    <>
      {/* ===== CSS ĐẸP NHẤT 2025 - VIẾT THẲNG TRONG FILE ===== */}
      <style jsx>{`
        .modern-event-table {
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 4px 10px -6px rgba(0, 0, 0, 0.04);
          padding: 24px;
          margin: 20px 0;
        }

        .modern-event-table :global(.ant-table) {
          border-radius: 12px;
          overflow: hidden;
        }

        /* Header bảng */
        .modern-event-table :global(.ant-table-thead > tr > th) {
          background: #f8fafc !important;
          color: #1e293b;
          font-weight: 600;
          font-size: 13.5px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          padding: 16px 12px !important;
          border-bottom: 2px solid #e2e8f0 !important;
        }

        /* Dòng dữ liệu */
        .modern-event-table :global(.ant-table-tbody > tr > td) {
          padding: 18px 12px !important;
          font-size: 14.5px;
          color: #475569;
          border-bottom: 1px solid #f1f5f9;
          transition: all 0.26s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Hover mượt như bơ */
        .modern-event-table :global(.ant-table-tbody > tr:hover > td {
          background-color: #f0f9ff !important;
          transform: translateY(-1px);
        }

        /* Nút đẹp hơn AntD mặc định */
        .modern-event-table :global(.ant-btn) {
          border-radius: 10px !important;
          height: 38px;
          font-weight: 500;
        }

        .modern-event-table :global(.ant-btn-primary) {
          background: #1677ff;
          border: none;
        }

        .modern-event-table :global(.ant-btn-primary:hover) {
          background: #0958d9 !important;
        }

        .modern-event-table :global(.ant-btn-dangerous) {
          background: #ff4d4f;
          color: white;
          border: none;
        }

        .modern-event-table :global(.ant-btn-dangerous:hover) {
          background: #d9363e !important;
        }

        /* Pagination đẹp */
        .modern-event-table :global(.ant-pagination-item-active) {
          background: #1677ff;
          border-color: #1677ff;
        }

        .modern-event-table :global(.ant-pagination-item-active a) {
          color: white !important;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .modern-event-table {
            padding: 12px;
          }
          .modern-event-table :global(.ant-btn) {
            font-size: 13px;
            height: 34px;
            padding: 0 10px;
          }
        }
      `}</style>

      {/* Bảng chính */}
      <div className="modern-event-table">
        <Table
          columns={columns}
          dataSource={data}
          pagination={{
            current: currentPage,
            pageSize,
            total,
            onChange: onPageChange,
          }}
          rowSelection={rowSelection}
          rowKey="_id"
        />
      </div>
    </>
  );
};

export default TableComponent;

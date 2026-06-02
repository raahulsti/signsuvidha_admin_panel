import { useState } from 'react';
import { Table, Tag, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useGetCustomersQuery } from '../api/adminApi';

const fmtMoney = (v) => `₹${Number(v || 0).toFixed(2)}`;
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : '-');

export default function Customers() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ page: 1, limit: 20 });
  const { data, isLoading } = useGetCustomersQuery(filters);
  const list = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, gap: 12 }}>
        <h2 style={{ margin: 0 }}>Customers</h2>
        <Input.Search
          placeholder="Search name, email, phone"
          allowClear
          style={{ width: 280 }}
          onSearch={(v) => setFilters((f) => ({ ...f, search: v || undefined, page: 1 }))}
        />
      </div>
      <Table
        dataSource={list}
        scroll={{ x: 1000 }}
        columns={[
          { title: 'Name', dataIndex: 'name', key: 'name', width: 180, ellipsis: true, render: (v) => v || '-' },
          { title: 'Email', dataIndex: 'email', key: 'email', width: 220, ellipsis: true, render: (v) => v || '-' },
          { title: 'Phone', dataIndex: 'phone', key: 'phone', width: 140, render: (v) => v || '-' },
          { title: 'Orders', dataIndex: 'order_count', key: 'order_count', width: 90, align: 'center', render: (v) => Number(v || 0) },
          { title: 'Total Spent', dataIndex: 'total_spent', key: 'total_spent', width: 120, align: 'right', render: fmtMoney },
          { title: 'Last Order', dataIndex: 'last_order_at', key: 'last_order_at', width: 120, render: fmtDate },
          {
            title: 'Status',
            dataIndex: 'is_active',
            key: 'is_active',
            width: 100,
            align: 'center',
            render: (v) => <Tag color={v ? 'green' : 'default'}>{v ? 'Active' : 'Inactive'}</Tag>,
          },
          {
            title: 'Action',
            key: 'actions',
            width: 80,
            fixed: 'right',
            align: 'center',
            render: (_, row) => <a onClick={() => navigate(`/customers/${row.id}`)}>View</a>,
          },
        ]}
        rowKey="id"
        loading={isLoading}
        onRow={(row) => ({ onClick: () => navigate(`/customers/${row.id}`), style: { cursor: 'pointer' } })}
        pagination={
          pagination
            ? {
                total: pagination.total,
                pageSize: pagination.limit,
                current: pagination.page,
                showSizeChanger: false,
                onChange: (page) => setFilters((f) => ({ ...f, page })),
              }
            : false
        }
      />
    </>
  );
}

import { useState } from 'react';
import { Table, Tag, Select } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useGetOrdersQuery } from '../api/adminApi';

export default function Orders() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({});
  const { data, isLoading } = useGetOrdersQuery(filters);
  const list = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Orders</h2>
        <Select placeholder="Status" allowClear style={{ width: 140 }} onChange={(v) => setFilters((f) => ({ ...f, status: v }))}>
          <Select.Option value="pending">Pending</Select.Option>
          <Select.Option value="confirmed">Confirmed</Select.Option>
          <Select.Option value="processing">Processing</Select.Option>
          <Select.Option value="shipped">Shipped</Select.Option>
          <Select.Option value="delivered">Delivered</Select.Option>
          <Select.Option value="cancelled">Cancelled</Select.Option>
        </Select>
      </div>
      <Table
        dataSource={list}
        scroll={{ x: 1500 }}
        columns={[
          {
            title: 'Order #',
            dataIndex: 'order_number',
            key: 'order_number',
            width: 200,
            fixed: 'left',
            ellipsis: true,
            render: (v) => v || '-',
          },
          { title: 'Customer', dataIndex: 'customer_name', key: 'customer_name', width: 130, ellipsis: true },
          { title: 'Vendor', dataIndex: 'vendor_name', key: 'vendor_name', width: 120, ellipsis: true },
          {
            title: 'Seller Type',
            dataIndex: 'seller_type',
            key: 'seller_type',
            width: 110,
            align: 'center',
            render: (v) => <Tag color={v === 'admin' ? 'blue' : 'purple'}>{v || '-'}</Tag>,
          },
          { title: 'Seller ID', dataIndex: 'seller_id', key: 'seller_id', width: 90, align: 'center', render: (v) => v ?? '-' },
          { title: 'Amount', dataIndex: 'total_amount', key: 'total_amount', width: 100, align: 'right', render: (v) => `₹${Number(v || 0).toFixed(2)}` },
          { title: 'GST %', dataIndex: 'gst_percent', key: 'gst_percent', width: 80, align: 'right', render: (v) => `${Number(v || 0).toFixed(2)}%` },
          { title: 'GST Amount', dataIndex: 'gst_amount', key: 'gst_amount', width: 110, align: 'right', render: (v) => `₹${Number(v || 0).toFixed(2)}` },
          {
            title: 'Payable',
            dataIndex: 'payable_amount',
            key: 'payable_amount',
            width: 110,
            align: 'right',
            render: (v, row) => `₹${Number(v ?? row.total_amount ?? 0).toFixed(2)}`,
          },
          { title: 'Items', dataIndex: 'item_count', key: 'item_count', width: 70, align: 'center' },
          {
            title: 'Payment',
            dataIndex: 'payment_status',
            key: 'payment_status',
            width: 100,
            align: 'center',
            render: (s) => <Tag color={s === 'paid' ? 'green' : 'orange'}>{s}</Tag>,
          },
          {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 110,
            align: 'center',
            render: (s) => <Tag>{s}</Tag>,
          },
          {
            title: 'Action',
            key: 'actions',
            width: 80,
            fixed: 'right',
            align: 'center',
            render: (_, row) => <a onClick={() => navigate(`/orders/${row.id}`)}>View</a>,
          },
        ]}
        rowKey="id"
        loading={isLoading}
        pagination={pagination ? { total: pagination.total, pageSize: pagination.limit, current: pagination.page } : false}
      />
    </>
  );
}

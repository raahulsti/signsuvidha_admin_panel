import { useState } from 'react';
import { Card, Descriptions, Row, Col, Statistic, Table, Tag, Button, Spin, Select } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetCustomerQuery, useGetCustomerOrdersQuery } from '../api/adminApi';

const fmtMoney = (v) => `₹${Number(v || 0).toFixed(2)}`;
const fmtDate = (d) => (d ? new Date(d).toLocaleString() : '-');

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orderFilters, setOrderFilters] = useState({ page: 1, limit: 20 });

  const { data: customerData, isLoading } = useGetCustomerQuery(id);
  const { data: ordersData, isLoading: ordersLoading } = useGetCustomerOrdersQuery({ id, ...orderFilters });

  const customer = customerData?.data ?? customerData;
  const orders = ordersData?.data ?? [];
  const pagination = ordersData?.pagination;
  const stats = customer?.stats ?? {};

  if (isLoading) return <Spin size="large" />;
  if (!customer) return <p>Customer not found</p>;

  return (
    <>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/customers')} style={{ marginBottom: 16 }}>
        Back to Customers
      </Button>

      <Card title={customer.name || 'Customer'} style={{ marginBottom: 16 }}>
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small">
          <Descriptions.Item label="Name">{customer.name || '-'}</Descriptions.Item>
          <Descriptions.Item label="Email">{customer.email || '-'}</Descriptions.Item>
          <Descriptions.Item label="Phone">{customer.phone || '-'}</Descriptions.Item>
          <Descriptions.Item label="Gender">{customer.gender || '-'}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={customer.is_active ? 'green' : 'default'}>{customer.is_active ? 'Active' : 'Inactive'}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Joined">{fmtDate(customer.created_at)}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}><Card><Statistic title="Total Orders" value={Number(stats.order_count || 0)} /></Card></Col>
        <Col xs={24} sm={8}><Card><Statistic title="Total Spent (paid)" value={Number(stats.total_spent || 0)} precision={2} prefix="₹" /></Card></Col>
        <Col xs={24} sm={8}><Card><Statistic title="Last Order" value={stats.last_order_at ? new Date(stats.last_order_at).toLocaleDateString() : '-'} /></Card></Col>
      </Row>

      <Card
        title="Orders"
        extra={
          <Select
            placeholder="Status"
            allowClear
            style={{ width: 150 }}
            onChange={(v) => setOrderFilters((f) => ({ ...f, status: v, page: 1 }))}
          >
            <Select.Option value="pending">Pending</Select.Option>
            <Select.Option value="confirmed">Confirmed</Select.Option>
            <Select.Option value="processing">Processing</Select.Option>
            <Select.Option value="shipped">Shipped</Select.Option>
            <Select.Option value="delivered">Delivered</Select.Option>
            <Select.Option value="cancelled">Cancelled</Select.Option>
            <Select.Option value="refunded">Refunded</Select.Option>
          </Select>
        }
      >
        <Table
          dataSource={orders}
          scroll={{ x: 900 }}
          columns={[
            { title: 'Order #', dataIndex: 'order_number', key: 'order_number', width: 200, ellipsis: true, render: (v) => v || '-' },
            { title: 'Vendor', dataIndex: 'vendor_name', key: 'vendor_name', width: 130, ellipsis: true, render: (v) => v || 'Admin' },
            { title: 'Amount', dataIndex: 'total_amount', key: 'total_amount', width: 100, align: 'right', render: fmtMoney },
            { title: 'Payable', dataIndex: 'payable_amount', key: 'payable_amount', width: 110, align: 'right', render: (v, r) => fmtMoney(v ?? r.total_amount) },
            { title: 'Items', dataIndex: 'item_count', key: 'item_count', width: 70, align: 'center' },
            { title: 'Payment', dataIndex: 'payment_status', key: 'payment_status', width: 100, align: 'center', render: (s) => <Tag color={s === 'paid' ? 'green' : 'orange'}>{s}</Tag> },
            { title: 'Status', dataIndex: 'status', key: 'status', width: 110, align: 'center', render: (s) => <Tag>{s}</Tag> },
            { title: 'Date', dataIndex: 'created_at', key: 'created_at', width: 160, render: fmtDate },
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
          loading={ordersLoading}
          pagination={
            pagination
              ? {
                  total: pagination.total,
                  pageSize: pagination.limit,
                  current: pagination.page,
                  showSizeChanger: false,
                  onChange: (page) => setOrderFilters((f) => ({ ...f, page })),
                }
              : false
          }
        />
      </Card>
    </>
  );
}

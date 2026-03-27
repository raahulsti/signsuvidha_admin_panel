import { useParams } from 'react-router-dom';
import { Card, Descriptions, Table, Select, message, Spin } from 'antd';
import { useGetOrderQuery, useUpdateOrderStatusMutation } from '../api/adminApi';

export default function OrderDetail() {
  const { id } = useParams();
  const { data, isLoading } = useGetOrderQuery(id);
  const [updateStatus] = useUpdateOrderStatusMutation();
  const order = data ?? {};
  const items = order.items ?? [];

  const handleStatusChange = async (status) => {
    try {
      await updateStatus({ id, status }).unwrap();
      message.success('Status updated');
    } catch (err) { message.error(err?.data?.message || 'Failed'); }
  };

  if (isLoading) return <Spin size="large" />;
  if (!order.id) return <div>Order not found</div>;

  return (
    <>
      <h2 style={{ marginBottom: 16 }}>Order #{order.order_number}</h2>
      <Card style={{ marginBottom: 16 }}>
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="Customer">{order.customer_name}</Descriptions.Item>
          <Descriptions.Item label="Vendor">{order.vendor_name}</Descriptions.Item>
          <Descriptions.Item label="Status">{order.status}</Descriptions.Item>
          <Descriptions.Item label="Payment">{order.payment_status}</Descriptions.Item>
          <Descriptions.Item label="Total">₹{Number(order.total_amount || 0).toFixed(2)}</Descriptions.Item>
        </Descriptions>
        <div style={{ marginTop: 16 }}>
          <span style={{ marginRight: 8 }}>Update status:</span>
          <Select value={order.status} style={{ width: 140 }} onChange={handleStatusChange}
            options={['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => ({ value: s, label: s }))}
          />
        </div>
      </Card>
      <Card title="Items">
        <Table dataSource={items} columns={[
          { title: 'Product', dataIndex: 'product_name', key: 'product_name' },
          { title: 'Qty', dataIndex: 'quantity', key: 'quantity', width: 80 },
          { title: 'Price', dataIndex: 'total_price', key: 'total_price', render: (v) => `₹${Number(v || 0).toFixed(2)}` },
        ]} rowKey="id" pagination={false} size="small" />
      </Card>
    </>
  );
}

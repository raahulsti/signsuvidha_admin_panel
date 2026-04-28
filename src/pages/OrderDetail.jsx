import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { Card, Descriptions, Table, Select, message, Spin, Button, Space, Modal, Input } from 'antd';
import { useGetOrderQuery, useUpdateOrderStatusMutation, useEmailOrderInvoiceMutation } from '../api/adminApi';

export default function OrderDetail() {
  const { id } = useParams();
  const { data, isLoading } = useGetOrderQuery(id);
  const [updateStatus] = useUpdateOrderStatusMutation();
  const [emailInvoice, { isLoading: isEmailing }] = useEmailOrderInvoiceMutation();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const order = data?.data ?? data ?? {};
  const items = order.items ?? [];

  const handleStatusChange = async (status) => {
    try {
      await updateStatus({ id, status }).unwrap();
      message.success('Status updated');
    } catch (err) { message.error(err?.data?.message || 'Failed'); }
  };

  const handleDownloadInvoice = async () => {
    try {
      setIsDownloading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/admin/orders/${id}/invoice/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error('Failed to download invoice');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${order.invoice_number || `invoice-${order.order_number || id}`}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      message.success('Invoice downloaded');
    } catch (err) {
      message.error(err?.message || 'Download failed');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleEmailInvoice = async () => {
    try {
      await emailInvoice({ id, email: recipientEmail || undefined }).unwrap();
      message.success('Invoice emailed to customer');
      setIsEmailModalOpen(false);
      setRecipientEmail('');
    } catch (err) {
      message.error(err?.data?.message || 'Failed to send invoice');
    }
  };

  if (isLoading) return <Spin size="large" />;
  if (!order.id) return <div>Order not found</div>;

  return (
    <>
      <h2 style={{ marginBottom: 16 }}>Order #{order.order_number}</h2>
      <Card style={{ marginBottom: 16 }}>
        <Space style={{ marginBottom: 12 }}>
          <Button type="primary" onClick={handleDownloadInvoice} loading={isDownloading}>
            Download Invoice
          </Button>
          <Button onClick={() => setIsEmailModalOpen(true)} loading={isEmailing}>
            Email Invoice
          </Button>
        </Space>
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="Customer">{order.customer_name}</Descriptions.Item>
          <Descriptions.Item label="Customer Email">{order.customer_email || '-'}</Descriptions.Item>
          <Descriptions.Item label="Vendor">{order.vendor_name}</Descriptions.Item>
          <Descriptions.Item label="Invoice #">{order.invoice_number || '-'}</Descriptions.Item>
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
      <Modal
        title="Email Invoice"
        open={isEmailModalOpen}
        onCancel={() => setIsEmailModalOpen(false)}
        onOk={handleEmailInvoice}
        okText="Send Invoice"
        confirmLoading={isEmailing}
      >
        <p style={{ marginBottom: 8 }}>Leave blank to use customer email saved on order.</p>
        <Input
          placeholder="customer@example.com"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
        />
      </Modal>
    </>
  );
}

import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { Card, Descriptions, Select, message, Spin, Button, Space, Modal, Input, Tag } from 'antd';
import { useGetOrderQuery, useUpdateOrderStatusMutation, useEmailOrderInvoiceMutation } from '../api/adminApi';
import OrderItemsDetail from '../components/OrderItemsDetail';

const fmt = (v) => `₹${Number(v || 0).toFixed(2)}`;

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
  const shipping = order.addresses?.shipping;
  const billing = order.addresses?.billing;
  const orderAmounts = {
    subtotal: order.subtotal ?? order.amounts?.subtotal,
    gst_percent: order.gst_percent ?? order.amounts?.gst_percent,
    gst_amount: order.gst_amount ?? order.amounts?.gst_amount,
    shipping_cost: order.shipping?.cost ?? order.amounts?.shipping_cost,
    payable_amount: order.payable_amount ?? order.amounts?.payable_amount,
  };

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
      <h2 style={{ marginBottom: 16 }}>Order #{order.order_number || order.id}</h2>
      <Card style={{ marginBottom: 16 }}>
        <Space style={{ marginBottom: 12 }}>
          <Button type="primary" onClick={handleDownloadInvoice} loading={isDownloading}>
            Download Invoice
          </Button>
        </Space>
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="Customer">{order.customer_name || order.customer?.name || '-'}</Descriptions.Item>
          <Descriptions.Item label="Phone">{order.customer_phone || order.customer?.phone || '-'}</Descriptions.Item>
          <Descriptions.Item label="Email">{order.customer_email || order.customer?.email || '-'}</Descriptions.Item>
          <Descriptions.Item label="Seller">
            {order.seller?.business_name || order.vendor_name || (order.seller_type === 'admin' ? 'SignsUvidha' : '-')}
          </Descriptions.Item>
          <Descriptions.Item label="Seller Type">
            <Tag color={order.seller_type === 'admin' ? 'blue' : 'purple'}>{order.seller_type || '-'}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Invoice #">{order.invoice_number || '-'}</Descriptions.Item>
          <Descriptions.Item label="Status"><Tag>{order.status}</Tag></Descriptions.Item>
          <Descriptions.Item label="Payment status"><Tag color={order.payment_status === 'paid' ? 'green' : 'orange'}>{order.payment_status}</Tag></Descriptions.Item>
          <Descriptions.Item label="Payment method">{order.payment_method || order.payment?.payment_method || '-'}</Descriptions.Item>
          <Descriptions.Item label="Subtotal">{fmt(order.subtotal ?? order.amounts?.subtotal)}</Descriptions.Item>
          <Descriptions.Item label="GST">{Number(order.gst_percent ?? order.amounts?.gst_percent ?? 0).toFixed(2)}% ({fmt(order.gst_amount ?? order.amounts?.gst_amount)})</Descriptions.Item>
          <Descriptions.Item label="Payable">{fmt(order.payable_amount ?? order.amounts?.payable_amount)}</Descriptions.Item>
          <Descriptions.Item label="Shipping">{order.shipping?.service_name || '-'} {order.shipping?.cost > 0 ? fmt(order.shipping.cost) : ''}</Descriptions.Item>
          {shipping && (
            <Descriptions.Item label="Ship to" span={2}>{shipping.formatted || `${shipping.full_name}, ${shipping.address_line1}, ${shipping.city}`}</Descriptions.Item>
          )}
          {billing && !order.addresses?.billing_same_as_shipping && (
            <Descriptions.Item label="Bill to" span={2}>{billing.formatted || `${billing.full_name}, ${billing.address_line1}`}</Descriptions.Item>
          )}
          {order.notes && <Descriptions.Item label="Notes" span={2}>{order.notes}</Descriptions.Item>}
        </Descriptions>
        <div style={{ marginTop: 16 }}>
          <span style={{ marginRight: 8 }}>Update status:</span>
          <Select value={order.status} style={{ width: 140 }} onChange={handleStatusChange}
            options={['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => ({ value: s, label: s }))}
          />
        </div>
      </Card>
      <Card title={`Order items (${items.length})`}>
        <OrderItemsDetail items={items} orderAmounts={orderAmounts} />
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
        <Input placeholder="customer@example.com" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} />
      </Modal>
    </>
  );
}

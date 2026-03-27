import { Card, Row, Col, Statistic, Table, Spin } from 'antd';
import { ShoppingCartOutlined, DollarOutlined, ShopOutlined, TeamOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useGetDashboardStatsQuery } from '../api/adminApi';

export default function Dashboard() {
  const { data, isLoading } = useGetDashboardStatsQuery();
  const stats = data ?? {};
  const recentOrders = stats.recent_orders ?? [];

  const columns = [
    { title: 'Order #', dataIndex: 'order_number', key: 'order_number', width: 120 },
    { title: 'Customer', dataIndex: 'customer_name', key: 'customer_name' },
    { title: 'Amount', dataIndex: 'total_amount', key: 'total_amount', render: (v) => `₹${Number(v || 0).toFixed(2)}` },
    { title: 'Status', dataIndex: 'status', key: 'status' },
  ];

  if (isLoading) return <Spin size="large" />;

  return (
    <>
      <h2 style={{ marginBottom: 24 }}>Dashboard</h2>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={8}><Card><Statistic title="Total Orders" value={stats.total_orders ?? 0} prefix={<ShoppingCartOutlined />} /></Card></Col>
        <Col xs={24} sm={12} lg={8}><Card><Statistic title="Revenue (₹)" value={Number(stats.total_revenue ?? 0).toLocaleString()} prefix={<DollarOutlined />} /></Card></Col>
        <Col xs={24} sm={12} lg={8}><Card><Statistic title="Vendors" value={stats.total_vendors ?? 0} prefix={<ShopOutlined />} /></Card></Col>
        <Col xs={24} sm={12} lg={8}><Card><Statistic title="Customers" value={stats.total_customers ?? 0} prefix={<TeamOutlined />} /></Card></Col>
        <Col xs={24} sm={12} lg={8}><Card><Statistic title="Pending Vendors" value={stats.pending_vendors ?? 0} prefix={<ClockCircleOutlined />} /></Card></Col>
      </Row>
      <Card title="Recent Orders"><Table dataSource={recentOrders} columns={columns} rowKey="id" pagination={false} size="small" /></Card>
    </>
  );
}

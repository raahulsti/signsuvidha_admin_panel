import { Card, Row, Col, Statistic, Table, Tag, Spin } from 'antd';
import { ShoppingCartOutlined, ShopOutlined, TeamOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useGetDashboardStatsQuery } from '../api/adminApi';

const RupeeIcon = () => (
  <span style={{ fontSize: 20 }}>
    ₹
  </span>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const { data, isLoading } = useGetDashboardStatsQuery(undefined, { refetchOnMountOrArgChange: true });
  const stats = data?.data ?? data ?? {};
  const recentOrders = stats.recent_orders ?? [];

  const columns = [
    { title: 'Order #', dataIndex: 'order_number', key: 'order_number', width: 230, render: (v) => <span style={{ whiteSpace: 'nowrap' }}>{v || '-'}</span> },
    { title: 'Customer', dataIndex: 'customer_name', key: 'customer_name', render: (v) => v || '-' },
    { title: 'Amount', dataIndex: 'total_amount', key: 'total_amount', align: 'right', render: (v) => `₹${Number(v || 0).toFixed(2)}` },
    { title: 'Status', dataIndex: 'status', key: 'status', align: 'center', render: (s) => <Tag>{s}</Tag> },
    { title: 'Date', dataIndex: 'created_at', key: 'created_at', render: (d) => (d ? new Date(d).toLocaleDateString() : '-') },
    {
      title: 'Action',
      key: 'actions',
      width: 80,
      align: 'center',
      render: (_, row) => <a onClick={(e) => { e.stopPropagation(); navigate(`/orders/${row.id}`); }}>View</a>,
    },
  ];

  if (isLoading) return <Spin size="large" />;

  return (
    <>
      <h2 style={{ marginBottom: 24 }}>Dashboard</h2>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card hoverable onClick={() => navigate('/orders')} style={{ cursor: 'pointer' }}>
            <Statistic title="Total Orders" value={stats.total_orders ?? 0} prefix={<ShoppingCartOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card><Statistic title="Revenue (₹)" value={Number(stats.total_revenue ?? 0).toLocaleString()} prefix={<RupeeIcon />} /></Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card hoverable onClick={() => navigate('/vendors')} style={{ cursor: 'pointer' }}>
            <Statistic title="Vendors" value={stats.total_vendors ?? 0} prefix={<ShopOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card hoverable onClick={() => navigate('/customers')} style={{ cursor: 'pointer' }}>
            <Statistic title="Customers" value={stats.total_customers ?? 0} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card hoverable onClick={() => navigate('/vendors')} style={{ cursor: 'pointer' }}>
            <Statistic title="Pending Vendors" value={stats.pending_vendors ?? 0} prefix={<ClockCircleOutlined />} />
          </Card>
        </Col>
      </Row>
      {/* <Card title="Recent Orders" extra={<Link to="/orders">View all</Link>}>
        <Table
          dataSource={recentOrders}
          columns={columns}
          rowKey="id"
          pagination={false}
          size="small"
          onRow={(row) => ({ onClick: () => navigate(`/orders/${row.id}`), style: { cursor: 'pointer' } })}
        />
      </Card> */}
    </>
  );
}

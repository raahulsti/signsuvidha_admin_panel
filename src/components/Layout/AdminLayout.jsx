import { useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown } from 'antd';
import { DashboardOutlined, ShopOutlined, BarcodeOutlined, ContainerOutlined, UserOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useLogoutMutation } from '../../api/authApi';
import { logout } from '../../features/auth/authSlice';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: <Link to="/">Dashboard</Link> },
  { key: '/product-types', icon: <BarcodeOutlined />, label: <Link to="/product-types">Product Types</Link> },
  { key: '/materials', icon: <BarcodeOutlined />, label: <Link to="/materials">Materials</Link> },
  { key: '/elements', icon: <BarcodeOutlined />, label: <Link to="/elements">Elements</Link> },
  { key: '/fonts', icon: <BarcodeOutlined />, label: <Link to="/fonts">Fonts</Link> },
  { key: '/font-sizes', icon: <BarcodeOutlined />, label: <Link to="/font-sizes">Font Sizes</Link> },
  { key: '/letter-styles', icon: <BarcodeOutlined />, label: <Link to="/letter-styles">Letter Styles</Link> },
  { key: '/dimension-units', icon: <BarcodeOutlined />, label: <Link to="/dimension-units">Dimension Units</Link> },
  { key: '/shipping-services', icon: <BarcodeOutlined />, label: <Link to="/shipping-services">Shipping Services</Link> },
  { key: '/listed-products', icon: <BarcodeOutlined />, label: <Link to="/listed-products">Listed Products</Link> },
  { key: '/colors', icon: <BarcodeOutlined />, label: <Link to="/colors">Colors</Link> },
  { key: '/shadow-colors', icon: <BarcodeOutlined />, label: <Link to="/shadow-colors">Shadow Colors</Link> },
  { key: '/border-colors', icon: <BarcodeOutlined />, label: <Link to="/border-colors">Border Colors</Link> },
  { key: '/base-colors', icon: <BarcodeOutlined />, label: <Link to="/base-colors">Base Colors</Link> },
  { key: '/vendors', icon: <ShopOutlined />, label: <Link to="/vendors">Vendors</Link> },
  { key: '/orders', icon: <ContainerOutlined />, label: <Link to="/orders">Orders</Link> },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [logoutApi] = useLogoutMutation();

  const handleLogout = async () => {
    try { await logoutApi(); } finally { dispatch(logout()); navigate('/login'); }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: collapsed ? 16 : 18, fontWeight: 600 }}>
          {collapsed ? 'SU' : 'SignsUvidha Admin'}
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]} items={menuItems} />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {collapsed ? <MenuUnfoldOutlined style={{ fontSize: 18, cursor: 'pointer' }} onClick={() => setCollapsed(false)} /> : <MenuFoldOutlined style={{ fontSize: 18, cursor: 'pointer' }} onClick={() => setCollapsed(true)} />}
          <Dropdown menu={{ items: [{ key: 'logout', icon: <LogoutOutlined />, label: 'Logout', onClick: handleLogout }] }} placement="bottomRight">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              <span>{user?.name || 'Admin'}</span>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24, minHeight: 280, background: '#fff', padding: 24, borderRadius: 8 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

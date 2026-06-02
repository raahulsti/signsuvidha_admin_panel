import { useEffect, useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown } from 'antd';
import {
  DashboardOutlined,
  ShopOutlined,
  ContainerOutlined,
  UserOutlined,
  TeamOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FileTextOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useLogoutMutation } from '../../api/authApi';
import { logout } from '../../features/auth/authSlice';

const { Header, Sider, Content } = Layout;

const masterMenuItems = [
  { path: '/product-types', label: 'Product Types' },
  { path: '/materials', label: 'Materials' },
  { path: '/material-styles', label: 'Material Styles' },
  { path: '/frames', label: 'Frames' },
  { path: '/wallpapers', label: 'Wallpapers' },
  { path: '/add-borders', label: 'Add Borders' },
  { path: '/lollipop-elements', label: 'Lollipop Elements' },
  { path: '/pylons', label: 'Pylons' },
  { path: '/bases', label: 'Bases' },
  { path: '/thicknesses', label: 'Thicknesses' },
  { path: '/image-assets', label: 'Image Assets' },
  { path: '/elements', label: 'Elements' },
  { path: '/fonts', label: 'Fonts' },
  { path: '/font-sizes', label: 'Font Sizes' },
  { path: '/letter-styles', label: 'Letter Styles' },
  { path: '/illumination-options', label: 'Lit / Non-Lit' },
  { path: '/dimension-units', label: 'Dimension Units' },
  { path: '/listed-products', label: 'Listed Products' },
  { path: '/colors', label: 'Colors' },
  { path: '/shadow-colors', label: 'Shadow Colors' },
  { path: '/border-colors', label: 'Border Colors' },
  { path: '/base-colors', label: 'Base Colors' },
];

const isMasterPath = (pathname) =>
  masterMenuItems.some(
    (item) => pathname === item.path || pathname.startsWith(`${item.path}/`)
  );

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: <Link to="/">Dashboard</Link> },
  {
    key: 'masters',
    icon: <AppstoreOutlined />,
    label: 'Masters',
    children: masterMenuItems.map(({ path, label }) => ({
      key: path,
      label: <Link to={path}>{label}</Link>,
    })),
  },
  { key: '/vendors', icon: <ShopOutlined />, label: <Link to="/vendors">Vendors</Link> },
  { key: '/orders', icon: <ContainerOutlined />, label: <Link to="/orders">Orders</Link> },
  { key: '/customers', icon: <TeamOutlined />, label: <Link to="/customers">Customers</Link> },
  { key: '/cms-pages', icon: <FileTextOutlined />, label: <Link to="/cms-pages">CMS Pages</Link> },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [logoutApi] = useLogoutMutation();

  useEffect(() => {
    if (isMasterPath(location.pathname)) {
      setOpenKeys((keys) => (keys.includes('masters') ? keys : [...keys, 'masters']));
    }
  }, [location.pathname]);

  const selectedKey = location.pathname.startsWith('/orders')
    ? '/orders'
    : location.pathname.startsWith('/customers')
      ? '/customers'
      : location.pathname;

  const handleLogout = async () => {
    try { await logoutApi(); } finally { dispatch(logout()); navigate('/login'); }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: collapsed ? 16 : 18, fontWeight: 600 }}>
          {collapsed ? 'SU' : 'SignsUvidha Admin'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          openKeys={openKeys}
          onOpenChange={setOpenKeys}
          items={menuItems}
        />
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

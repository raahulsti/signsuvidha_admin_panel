import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation } from '../api/authApi';
import { setCredentials } from '../features/auth/authSlice';

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [login, { isLoading }] = useLoginMutation();

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const onFinish = async (values) => {
    try {
      const response = await login(values).unwrap();
      const payload = response?.data ?? response;

      if (payload?.accessToken && payload?.user) {
        dispatch(
          setCredentials({
            user: payload.user,
            accessToken: payload.accessToken,
            refreshToken: payload.refreshToken,
          })
        );
        message.success('Login successful');
        navigate('/', { replace: true });
      } else {
        message.error(response?.message || 'Invalid response');
      }
    } catch (err) { message.error(err?.data?.message || err?.message || 'Login failed'); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Card title="SignSuvidha Admin" style={{ width: 400 }} headStyle={{ textAlign: 'center', fontSize: 20 }}>
        <Form onFinish={onFinish} layout="vertical" size="large">
          <Form.Item name="email" rules={[{ required: true, type: 'email' }]}><Input prefix={<UserOutlined />} placeholder="Email" /></Form.Item>
          <Form.Item name="password" rules={[{ required: true }]}><Input.Password prefix={<LockOutlined />} placeholder="Password" /></Form.Item>
          <Form.Item><Button type="primary" htmlType="submit" block loading={isLoading}>Sign In</Button></Form.Item>
        </Form>
      </Card>
    </div>
  );
}

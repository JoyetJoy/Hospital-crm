import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';
import api from '../../services/api';
const {
  Title,
  Text
} = Typography;
const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const onFinish = async values => {
    try {
      setLoading(true);
      const {
        data
      } = await api.post('/auth/login', values);
      dispatch(setCredentials({
        user: data.user,
        token: data.token
      }));
      message.success('Login successful!');
      navigate('/');
    } catch (error) {
      message.error(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #4F46E5 0%, #10B981 100%)'
  }}>
      <Card className="glass" style={{
      width: 400,
      padding: '20px',
      borderRadius: '16px'
    }}>
        <div style={{
        textAlign: 'center',
        marginBottom: 32
      }}>
          <Title level={2} style={{
          color: '#111827',
          marginBottom: 8
        }}>MedCRM Pro</Title>
          <Text type="secondary">Sign in to manage hospitals & quotations</Text>
        </div>
        <Form name="login" onFinish={onFinish} layout="vertical" size="large">
          <Form.Item name="email" rules={[{
          required: true,
          message: 'Please input your Email!'
        }, {
          type: 'email',
          message: 'Invalid email format!'
        }]}>
            <Input prefix={<UserOutlined />} placeholder="Email Address" />
          </Form.Item>
          <Form.Item name="password" rules={[{
          required: true,
          message: 'Please input your Password!'
        }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block style={{
            marginTop: 16
          }}>
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>;
};
export default Login;
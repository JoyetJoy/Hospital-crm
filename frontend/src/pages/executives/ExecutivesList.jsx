import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Typography, Drawer, Form, Input, Select, message, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import api from '../../services/api';
const {
  Title
} = Typography;
const {
  Option
} = Select;
const ExecutivesList = () => {
  const [executives, setExecutives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [form] = Form.useForm();
  useEffect(() => {
    fetchExecutives();
  }, []);
  const fetchExecutives = async () => {
    try {
      setLoading(true);
      const {
        data
      } = await api.get('/executives');
      setExecutives(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const onFinish = async values => {
    try {
      await api.post('/executives', values);
      message.success('Executive created successfully');
      setDrawerVisible(false);
      form.resetFields();
      fetchExecutives();
    } catch (error) {
      message.error('Failed to create executive');
    }
  };
  const columns = [{
    title: 'Name',
    key: 'name',
    render: (_, record) => `${record.user?.firstName} ${record.user?.lastName}`
  }, {
    title: 'Email',
    key: 'email',
    render: (_, record) => record.user?.email
  }, {
    title: 'Emp Code',
    dataIndex: 'employeeCode',
    key: 'employeeCode'
  }, {
    title: 'Territory',
    dataIndex: 'territory',
    key: 'territory'
  }, {
    title: 'Target',
    dataIndex: 'target',
    key: 'target',
    render: val => `₹${val || 0}`
  }, {
    title: 'Role',
    key: 'role',
    render: (_, record) => <Tag color="geekblue">{record.user?.role?.name || 'Executive'}</Tag>
  }];
  return <div>
      <div className="page-header">
        <Title level={3} className="page-title">Executive Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setDrawerVisible(true)}>Add Executive</Button>
      </div>

      <Card>
        <Table scroll={{
        x: 'max-content'
      }} columns={columns} dataSource={executives} rowKey="id" loading={loading} />
      </Card>

      <Drawer title="Add New Executive" placement="right" width={400} onClose={() => setDrawerVisible(false)} open={drawerVisible}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="firstName" label="First Name" rules={[{
          required: true
        }]}>
            <Input />
          </Form.Item>
          <Form.Item name="lastName" label="Last Name" rules={[{
          required: true
        }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{
          required: true,
          type: 'email'
        }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{
          required: true
        }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="employeeCode" label="Employee Code">
            <Input />
          </Form.Item>
          <Form.Item name="territory" label="Territory">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>Create Account</Button>
          </Form.Item>
        </Form>
      </Drawer>
    </div>;
};
export default ExecutivesList;
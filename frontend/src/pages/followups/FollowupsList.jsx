import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Typography, Tag, Space, Drawer, Form, Input, DatePicker, Select, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import api from '../../services/api';
import dayjs from 'dayjs';
const {
  Title
} = Typography;
const {
  Option
} = Select;
const {
  TextArea
} = Input;
const FollowupsList = () => {
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [form] = Form.useForm();
  useEffect(() => {
    fetchFollowups();
    fetchHospitals();
  }, []);
  const fetchFollowups = async () => {
    try {
      setLoading(true);
      const {
        data
      } = await api.get('/followups');
      setFollowups(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const fetchHospitals = async () => {
    try {
      const {
        data
      } = await api.get('/hospitals');
      setHospitals(data);
    } catch (error) {
      console.error(error);
    }
  };
  const onFinish = async values => {
    try {
      const payload = {
        ...values,
        followupDate: values.followupDate.format('YYYY-MM-DD')
      };
      await api.post('/followups', payload);
      message.success('Follow-up scheduled');
      setDrawerVisible(false);
      form.resetFields();
      fetchFollowups();
    } catch (error) {
      message.error('Failed to schedule follow-up');
    }
  };
  const updateStatus = async (id, status) => {
    try {
      await api.put(`/followups/${id}`, {
        status
      });
      message.success('Status updated');
      fetchFollowups();
    } catch (error) {
      message.error('Update failed');
    }
  };
  const columns = [{
    title: 'Date',
    dataIndex: 'followupDate',
    key: 'followupDate',
    render: val => dayjs(val).format('MMM DD, YYYY')
  }, {
    title: 'Hospital',
    key: 'hospital',
    render: (_, record) => record.hospital?.name
  }, {
    title: 'Type',
    dataIndex: 'followupType',
    key: 'followupType'
  }, {
    title: 'Priority',
    dataIndex: 'priority',
    key: 'priority',
    render: val => <Tag color={val === 'High' ? 'red' : val === 'Medium' ? 'orange' : 'blue'}>{val}</Tag>
  }, {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: val => <Tag color={val === 'Completed' ? 'green' : val === 'Cancelled' ? 'default' : 'processing'}>{val}</Tag>
  }, {
    title: 'Actions',
    key: 'actions',
    render: (_, record) => record.status === 'Pending' && <Space>
            <Button size="small" type="primary" onClick={() => updateStatus(record.id, 'Completed')}>Mark Done</Button>
            <Button size="small" danger onClick={() => updateStatus(record.id, 'Cancelled')}>Cancel</Button>
          </Space>
  }];
  return <div>
      <div className="page-header">
        <Title level={3} className="page-title">Follow-ups & Reminders</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setDrawerVisible(true)}>Schedule Follow-up</Button>
      </div>

      <Card>
        <Table scroll={{
        x: 'max-content'
      }} columns={columns} dataSource={followups} rowKey="id" loading={loading} />
      </Card>

      <Drawer title="Schedule Follow-up" placement="right" width={400} onClose={() => setDrawerVisible(false)} open={drawerVisible}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="hospitalId" label="Hospital" rules={[{
          required: true
        }]}>
            <Select showSearch>
              {hospitals.map(h => <Option key={h.id} value={h.id}>{h.name}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="followupDate" label="Date" rules={[{
          required: true
        }]}>
            <DatePicker style={{
            width: '100%'
          }} />
          </Form.Item>
          <Form.Item name="followupType" label="Type" initialValue="Call" rules={[{
          required: true
        }]}>
            <Select>
              <Option value="Call">Call</Option>
              <Option value="Visit">Visit</Option>
              <Option value="Quotation">Quotation</Option>
              <Option value="Demo">Demo</Option>
              <Option value="Payment">Payment</Option>
            </Select>
          </Form.Item>
          <Form.Item name="priority" label="Priority" initialValue="Medium" rules={[{
          required: true
        }]}>
            <Select>
              <Option value="High">High</Option>
              <Option value="Medium">Medium</Option>
              <Option value="Low">Low</Option>
            </Select>
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>Schedule</Button>
          </Form.Item>
        </Form>
      </Drawer>
    </div>;
};
export default FollowupsList;
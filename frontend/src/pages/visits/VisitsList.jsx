import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Typography, Tag, Space, Drawer, Form, Input, DatePicker, Select, Upload, message } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
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
const VisitsList = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  useEffect(() => {
    fetchVisits();
    fetchHospitals();
  }, []);
  const fetchVisits = async () => {
    try {
      setLoading(true);
      const {
        data
      } = await api.get('/visits');
      setVisits(data);
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
      const formData = new FormData();
      formData.append('hospitalId', values.hospitalId);
      formData.append('visitDate', values.visitDate.format('YYYY-MM-DD'));
      formData.append('visitTime', values.visitTime || '');
      formData.append('purpose', values.purpose);
      formData.append('notes', values.notes || '');
      formData.append('productsDiscussed', values.productsDiscussed || '');
      formData.append('outcome', values.outcome || '');
      formData.append('status', values.status);
      fileList.forEach(file => {
        formData.append('images', file.originFileObj);
      });
      await api.post('/visits', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      message.success('Visit added successfully');
      setDrawerVisible(false);
      form.resetFields();
      setFileList([]);
      fetchVisits();
    } catch (error) {
      message.error('Failed to add visit');
    }
  };
  const columns = [{
    title: 'Date',
    dataIndex: 'visitDate',
    key: 'visitDate',
    render: val => dayjs(val).format('MMM DD, YYYY')
  }, {
    title: 'Hospital',
    key: 'hospital',
    render: (_, record) => record.hospital?.name
  }, {
    title: 'Executive',
    key: 'executive',
    render: (_, record) => record.executive?.user?.firstName
  }, {
    title: 'Purpose',
    dataIndex: 'purpose',
    key: 'purpose'
  }, {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: status => <Tag color={status === 'Order Won' ? 'green' : status === 'Order Lost' ? 'red' : 'blue'}>{status}</Tag>
  }];
  return <div>
      <div className="page-header">
        <Title level={3} className="page-title">Visits Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setDrawerVisible(true)}>Log Visit</Button>
      </div>

      <Card>
        <Table scroll={{
        x: 'max-content'
      }} columns={columns} dataSource={visits} rowKey="id" loading={loading} />
      </Card>

      <Drawer title="Log New Visit" placement="right" width={500} onClose={() => setDrawerVisible(false)} open={drawerVisible}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="hospitalId" label="Hospital" rules={[{
          required: true
        }]}>
            <Select showSearch optionFilterProp="children">
              {hospitals.map(h => <Option key={h.id} value={h.id}>{h.name}</Option>)}
            </Select>
          </Form.Item>
          <Space style={{
          display: 'flex'
        }}>
            <Form.Item name="visitDate" label="Date" rules={[{
            required: true
          }]} style={{
            flex: 1
          }}>
              <DatePicker style={{
              width: '100%'
            }} />
            </Form.Item>
            <Form.Item name="visitTime" label="Time" style={{
            flex: 1
          }}>
              <Input type="time" />
            </Form.Item>
          </Space>
          <Form.Item name="purpose" label="Purpose" rules={[{
          required: true
        }]}>
            <Input />
          </Form.Item>
          <Form.Item name="productsDiscussed" label="Products Discussed">
            <Input placeholder="e.g. ICU Beds, Monitors" />
          </Form.Item>
          <Form.Item name="outcome" label="Outcome">
            <Input />
          </Form.Item>
          <Form.Item name="status" label="Status" initialValue="Interested" rules={[{
          required: true
        }]}>
            <Select>
              <Option value="Interested">Interested</Option>
              <Option value="Follow Up Required">Follow Up Required</Option>
              <Option value="Quotation Sent">Quotation Sent</Option>
              <Option value="Negotiation">Negotiation</Option>
              <Option value="Order Won">Order Won</Option>
              <Option value="Order Lost">Order Lost</Option>
            </Select>
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item label="Upload Images">
            <Upload beforeUpload={() => false} fileList={fileList} onChange={({
            fileList
          }) => setFileList(fileList)} multiple listType="picture">
              <Button icon={<UploadOutlined />}>Select Files</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>Save Visit</Button>
          </Form.Item>
        </Form>
      </Drawer>
    </div>;
};
export default VisitsList;
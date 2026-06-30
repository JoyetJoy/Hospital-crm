import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Typography, Tag, Space, Drawer, Form, Input, DatePicker, Select, message, Switch, Upload } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import api from '../../services/api';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const FollowupsList = () => {
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hospitals, setHospitals] = useState([]);
  
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [form] = Form.useForm();
  
  // States for marking done via logging a visit
  const [visitDrawerVisible, setVisitDrawerVisible] = useState(false);
  const [visitForm] = Form.useForm();
  const [selectedFollowup, setSelectedFollowup] = useState(null);
  const [createFollowup, setCreateFollowup] = useState(false);
  const [visitFileList, setVisitFileList] = useState([]);

  useEffect(() => {
    fetchFollowups();
    fetchHospitals();
  }, []);

  const fetchFollowups = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/followups');
      setFollowups(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHospitals = async () => {
    try {
      const { data } = await api.get('/hospitals');
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
      await api.put(`/followups/${id}`, { status });
      message.success('Status updated');
      fetchFollowups();
    } catch (error) {
      message.error('Update failed');
    }
  };

  const openVisitDrawerForFollowup = (record) => {
    setSelectedFollowup(record);
    visitForm.setFieldsValue({
      hospitalId: record.hospitalId,
      visitDate: dayjs(),
      requirement: record.followupType + ' Follow-up',
      notes: record.notes
    });
    setVisitDrawerVisible(true);
  };

  const onVisitFinish = async (values) => {
    try {
      const formData = new FormData();
      formData.append('hospitalId', values.hospitalId);
      formData.append('visitDate', values.visitDate.format('YYYY-MM-DD'));
      formData.append('visitTime', values.visitTime || '');
      formData.append('requirement', values.requirement || '');
      formData.append('remarks', values.remarks || '');
      formData.append('notes', values.notes || '');
      formData.append('createFollowup', createFollowup);
      if (createFollowup && values.followupDate) {
        formData.append('followupDate', values.followupDate.format('YYYY-MM-DD'));
        if (values.followupTime) formData.append('followupTime', values.followupTime);
      }
      if (visitFileList.length > 0) {
        formData.append('images', visitFileList[0].originFileObj);
      }
      if (values.contactName) formData.append('contactName', values.contactName);
      if (values.contactPhone) formData.append('contactPhone', values.contactPhone);
      if (values.contactEmail) formData.append('contactEmail', values.contactEmail);

      await api.post('/visits', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Update follow-up status
      if (selectedFollowup) {
        await api.put(`/followups/${selectedFollowup.id}`, { status: 'Completed' });
      }

      message.success('Visit logged and follow-up completed');
      setVisitDrawerVisible(false);
      visitForm.resetFields();
      setVisitFileList([]);
      setCreateFollowup(false);
      fetchFollowups();
    } catch (error) {
      message.error('Failed to log visit');
    }
  };

  const columns = [
    {
      title: 'Sl No',
      key: 'slNo',
      render: (_, __, index) => index + 1,
      width: 70
    },
    {
      title: 'Date',
      dataIndex: 'followupDate',
      key: 'followupDate',
      render: val => dayjs(val).format('MMM DD, YYYY')
    },
    {
      title: 'Time',
      dataIndex: 'followupTime',
      key: 'followupTime',
      render: val => val ? val : 'N/A'
    },
    {
      title: 'Hospital',
      key: 'hospital',
      render: (_, record) => record.hospital?.name
    },
    {
      title: 'Type',
      dataIndex: 'followupType',
      key: 'followupType'
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: val => <Tag color={val === 'High' ? 'red' : val === 'Medium' ? 'orange' : 'blue'}>{val}</Tag>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: val => <Tag color={val === 'Completed' ? 'green' : val === 'Cancelled' ? 'default' : 'processing'}>{val}</Tag>
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => record.status === 'Pending' && (
        <Space>
          <Button size="small" type="primary" onClick={() => openVisitDrawerForFollowup(record)}>Mark Done (Log Visit)</Button>
          <Button size="small" danger onClick={() => updateStatus(record.id, 'Cancelled')}>Cancel</Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div className="page-header">
        <Title level={3} className="page-title">Follow-ups & Reminders</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setDrawerVisible(true)}>Schedule Follow-up</Button>
      </div>

      <Card>
        <Table className="compact-table" size="small" scroll={{ x: 'max-content' }} columns={columns} dataSource={followups} rowKey="id" loading={loading} />
      </Card>

      <Drawer title="Schedule Follow-up" placement="right" width={400} onClose={() => setDrawerVisible(false)} open={drawerVisible}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="hospitalId" label="Hospital" rules={[{ required: true }]}>
            <Select showSearch optionFilterProp="children">
              {hospitals.map(h => <Option key={h.id} value={h.id}>{h.name}</Option>)}
            </Select>
          </Form.Item>
          
          <div style={{ display: 'flex', width: '100%', gap: '8px' }}>
            <Form.Item name="followupDate" label="Date" rules={[{ required: true }]} style={{ flex: 1 }}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="followupTime" label="Time" style={{ flex: 1 }}>
              <Input type="time" style={{ width: '100%' }} />
            </Form.Item>
          </div>
          
          <Form.Item name="followupType" label="Type" initialValue="Call" rules={[{ required: true }]}>
            <Select style={{ width: '100%' }}>
              <Option value="Call">Call</Option>
              <Option value="Visit">Visit</Option>
              <Option value="Quotation">Quotation</Option>
              <Option value="Demo">Demo</Option>
              <Option value="Payment">Payment</Option>
            </Select>
          </Form.Item>
          <Form.Item name="priority" label="Priority" initialValue="Medium" rules={[{ required: true }]}>
            <Select style={{ width: '100%' }}>
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

      <Drawer title="Complete Follow-up (Log Visit)" placement="right" width={500} onClose={() => setVisitDrawerVisible(false)} open={visitDrawerVisible}>
        <Form form={visitForm} layout="vertical" onFinish={onVisitFinish}>
          <Form.Item name="hospitalId" label="Hospital" rules={[{ required: true }]}>
            <Select showSearch optionFilterProp="children" disabled>
              {hospitals.map(h => <Option key={h.id} value={h.id}>{h.name}</Option>)}
            </Select>
          </Form.Item>
          <div style={{ display: 'flex', width: '100%', gap: '8px' }}>
            <Form.Item name="visitDate" label="Date" rules={[{ required: true }]} style={{ flex: 1 }}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="visitTime" label="Time" style={{ flex: 1 }}>
              <Input type="time" style={{ width: '100%' }} />
            </Form.Item>
          </div>
          <Form.Item name="requirement" label="Requirement" rules={[{ required: true }]}>
            <Input placeholder="Enter requirements discussed" />
          </Form.Item>
          
          <Card size="small" title="Contact Person (Optional)" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', width: '100%', gap: '8px' }}>
              <Form.Item name="contactName" label="Name" style={{ flex: 1, marginBottom: 0 }}>
                <Input placeholder="Name" />
              </Form.Item>
              <Form.Item name="contactPhone" label="Phone" style={{ flex: 1, marginBottom: 0 }}>
                <Input placeholder="Phone" />
              </Form.Item>
              <Form.Item name="contactEmail" label="Email" style={{ flex: 1, marginBottom: 0 }}>
                <Input type="email" placeholder="Email" />
              </Form.Item>
            </div>
          </Card>

          <div style={{ display: 'flex', width: '100%', gap: '8px' }}>
            <Form.Item name="remarks" label="Remarks" style={{ flex: 1 }}>
              <TextArea rows={2} placeholder="Any general remarks..." />
            </Form.Item>
            <Form.Item name="priority" label="Priority" initialValue="Medium" style={{ flex: 1 }}>
              <Select style={{ width: '100%' }}>
                <Select.Option value="High">High</Select.Option>
                <Select.Option value="Medium">Medium</Select.Option>
                <Select.Option value="Low">Low</Select.Option>
              </Select>
            </Form.Item>
          </div>
          <Form.Item name="notes" label="Notes">
            <TextArea rows={2} placeholder="Additional notes..." />
          </Form.Item>
          
          <Form.Item label="Schedule Another Follow-up?">
            <Switch checked={createFollowup} onChange={setCreateFollowup} />
          </Form.Item>
          
          {createFollowup && (
            <div style={{ display: 'flex', width: '100%', gap: '8px' }}>
              <Form.Item name="followupDate" label="Follow-up Date" rules={[{ required: true }]} style={{ flex: 1 }}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="followupTime" label="Follow-up Time" style={{ flex: 1 }}>
                <Input type="time" style={{ width: '100%' }} />
              </Form.Item>
            </div>
          )}

          <Form.Item label="Upload Quotation PDF">
            <Upload beforeUpload={() => false} accept=".pdf" fileList={visitFileList} onChange={({ fileList: newFileList }) => setVisitFileList(newFileList.slice(-1))} multiple={false}>
              <Button icon={<UploadOutlined />}>Select PDF</Button>
            </Upload>
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" block>Save Visit & Complete</Button>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default FollowupsList;
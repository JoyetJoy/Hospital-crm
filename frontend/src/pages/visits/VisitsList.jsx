import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Typography, Tag, Space, Drawer, Form, Input, DatePicker, Select, message, Switch, Modal, Descriptions, Upload } from 'antd';
import { PlusOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons';
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
  const [createFollowup, setCreateFollowup] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [form] = Form.useForm();
  
  const [visitModalVisible, setVisitModalVisible] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
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
      formData.append('requirement', values.requirement || '');
      formData.append('remarks', values.remarks || '');
      formData.append('notes', values.notes || '');
      formData.append('createFollowup', createFollowup);
      if (createFollowup && values.followupDate) {
        formData.append('followupDate', values.followupDate.format('YYYY-MM-DD'));
        if (values.followupTime) formData.append('followupTime', values.followupTime);
      }
      if (fileList.length > 0) {
        formData.append('images', fileList[0].originFileObj);
      }
      if (values.contactName) formData.append('contactName', values.contactName);
      if (values.contactPhone) formData.append('contactPhone', values.contactPhone);
      if (values.contactEmail) formData.append('contactEmail', values.contactEmail);

      await api.post('/visits', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      message.success('Visit added successfully');
      setDrawerVisible(false);
      form.resetFields();
      setFileList([]);
      setCreateFollowup(false);
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
    title: 'Time',
    dataIndex: 'visitTime',
    key: 'visitTime',
    render: text => text || 'N/A'
  }, {
    title: 'Hospital',
    key: 'hospital',
    render: (_, record) => record.hospital?.name
  }, {
    title: 'Executive',
    key: 'executive',
    render: (_, record) => record.executive?.user?.firstName
  }, {
    title: 'Requirement',
    dataIndex: 'requirement',
    key: 'requirement',
    render: text => text || 'N/A'
  }, {
    title: 'Remarks',
    dataIndex: 'remarks',
    key: 'remarks',
    render: text => text || 'N/A'
  }, {
    title: 'Actions',
    key: 'actions',
    render: (_, record) => (
      <Button type="link" size="small" onClick={() => {
        setSelectedVisit(record);
        setVisitModalVisible(true);
      }}>View Details</Button>
    )
  }];
  const handleExport = async () => {
    try {
      const response = await api.get('/visits/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'visits_report.xlsx');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      message.error('Failed to export visits');
    }
  };

  return <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3} className="page-title" style={{ margin: 0 }}>Visits Management</Title>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>Export to Excel</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setDrawerVisible(true)}>Log Visit</Button>
        </Space>
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
          <Form.Item name="requirement" label="Requirement" rules={[{ required: true }]}>
            <Input placeholder="Enter requirements discussed" />
          </Form.Item>
          
          <Card size="small" title="Contact Person (Optional)" style={{ marginBottom: 16 }}>
            <Form.Item name="contactName" label="Name" style={{ marginBottom: 12 }}>
              <Input placeholder="Contact person name" />
            </Form.Item>
            <Space style={{ display: 'flex', width: '100%' }}>
              <Form.Item name="contactPhone" label="Phone" style={{ flex: 1, marginBottom: 0 }}>
                <Input placeholder="Phone number" />
              </Form.Item>
              <Form.Item name="contactEmail" label="Email" style={{ flex: 1, marginBottom: 0 }}>
                <Input type="email" placeholder="Email address" />
              </Form.Item>
            </Space>
          </Card>

          <Form.Item name="remarks" label="Remarks">
            <TextArea rows={2} placeholder="Any general remarks..." />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <TextArea rows={2} placeholder="Additional notes..." />
          </Form.Item>
          
          <Form.Item label="Schedule Follow-up?">
            <Switch checked={createFollowup} onChange={setCreateFollowup} />
          </Form.Item>
          
          {createFollowup && (
            <Space style={{ display: 'flex' }}>
              <Form.Item name="followupDate" label="Follow-up Date" rules={[{ required: true }]} style={{ flex: 1 }}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="followupTime" label="Follow-up Time" style={{ flex: 1 }}>
                <Input type="time" />
              </Form.Item>
            </Space>
          )}
          
          <Form.Item label="Upload Quotation PDF">
            <Upload beforeUpload={() => false} accept=".pdf" fileList={fileList} onChange={({ fileList: newFileList }) => setFileList(newFileList.slice(-1))} multiple={false}>
              <Button icon={<UploadOutlined />}>Select PDF</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>Save Visit</Button>
          </Form.Item>
        </Form>
      </Drawer>

      <Modal title="Visit Details" open={visitModalVisible} onCancel={() => setVisitModalVisible(false)} footer={<Button onClick={() => setVisitModalVisible(false)}>Close</Button>}>
        {selectedVisit && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Date">{new Date(selectedVisit.visitDate).toLocaleDateString()}</Descriptions.Item>
            {selectedVisit.visitTime && <Descriptions.Item label="Time">{selectedVisit.visitTime}</Descriptions.Item>}
            <Descriptions.Item label="Hospital">{selectedVisit.hospital?.name}</Descriptions.Item>
            <Descriptions.Item label="Requirement">{selectedVisit.requirement}</Descriptions.Item>
            {selectedVisit.contactName && <Descriptions.Item label="Contact Name">{selectedVisit.contactName}</Descriptions.Item>}
            {selectedVisit.contactPhone && <Descriptions.Item label="Contact Phone">{selectedVisit.contactPhone}</Descriptions.Item>}
            {selectedVisit.contactEmail && <Descriptions.Item label="Contact Email">{selectedVisit.contactEmail}</Descriptions.Item>}
            <Descriptions.Item label="Remarks">{selectedVisit.remarks}</Descriptions.Item>
            <Descriptions.Item label="Notes">{selectedVisit.notes}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>;
};
export default VisitsList;
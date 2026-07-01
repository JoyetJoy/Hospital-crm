import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Typography, Tag, Space, Drawer, Form, Input, DatePicker, Select, message, Switch, Modal, Descriptions, Upload } from 'antd';
import { PlusOutlined, UploadOutlined, DownloadOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
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
  const [editingVisit, setEditingVisit] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [executives, setExecutives] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalVisits, setTotalVisits] = useState(0);
  
  const user = useSelector(state => state.auth.user);
  const userRole = user?.role?.name || user?.role;
  const isAdmin = typeof userRole === 'string' && userRole.toLowerCase().includes('admin');

  useEffect(() => {
    fetchVisits(currentPage, pageSize);
    fetchHospitals();
    if (isAdmin) fetchExecutives();
  }, [isAdmin, currentPage, pageSize]);

  const fetchExecutives = async () => {
    try {
      const { data } = await api.get('/executives');
      setExecutives(data);
    } catch (e) {
      console.error(e);
    }
  };
  const fetchVisits = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const {
        data
      } = await api.get(`/visits?page=${page}&limit=${limit}`);
      setVisits(data.data || data);
      setTotalVisits(data.pagination?.total || data.length || 0);
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
      if (values.competitor) formData.append('competitor', values.competitor);
      if (values.priority) formData.append('priority', values.priority);
      if (values.executiveId) formData.append('executiveId', values.executiveId);

      if (editingVisit) {
        await api.put(`/visits/${editingVisit.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        message.success('Visit updated successfully');
      } else {
        await api.post('/visits', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        message.success('Visit added successfully');
      }
      setDrawerVisible(false);
      form.resetFields();
      setFileList([]);
      setCreateFollowup(false);
      setEditingVisit(null);
      fetchVisits();
    } catch (error) {
      message.error(editingVisit ? 'Failed to update visit' : 'Failed to add visit');
    }
  };

  const handleEdit = (record) => {
    setEditingVisit(record);

    let hasFollowup = false;
    let followupDate = null;
    let followupTime = null;
    if (record.followups && record.followups.length > 0) {
      hasFollowup = true;
      followupDate = dayjs(record.followups[0].followupDate);
      followupTime = record.followups[0].followupTime;
    }
    setCreateFollowup(hasFollowup);

    if (record.images) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const baseUrl = apiUrl.replace('/api', '');
      const fileName = record.images.split('/').pop();
      setFileList([{
        uid: '-1',
        name: fileName,
        status: 'done',
        url: `${baseUrl}${record.images}`
      }]);
    } else {
      setFileList([]);
    }

    form.setFieldsValue({
      hospitalId: record.hospitalId,
      executiveId: record.executiveId,
      visitDate: dayjs(record.visitDate),
      visitTime: record.visitTime,
      requirement: record.requirement,
      competitor: record.competitor,
      priority: record.priority || 'Medium',
      contactName: record.contactName,
      contactPhone: record.contactPhone,
      contactEmail: record.contactEmail,
      remarks: record.remarks,
      notes: record.notes,
      followupDate: followupDate,
      followupTime: followupTime,
    });
    setDrawerVisible(true);
  };
  const columns = [{
    title: 'Sl No',
    key: 'slNo',
    render: (_, __, index) => index + 1,
    width: 70
  }, {
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
      <Space>
        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => {
          setSelectedVisit(record);
          setVisitModalVisible(true);
        }} />
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
      </Space>
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
          <Button type="primary" icon={<PlusOutlined />} onClick={() => {
            form.resetFields();
            form.setFieldsValue({
              visitDate: dayjs(),
              visitTime: dayjs().format('HH:mm')
            });
            setDrawerVisible(true);
          }}>Log Visit</Button>
        </Space>
      </div>

      <Card>
        <Table className="compact-table" size="small" scroll={{
        x: 'max-content'
      }} columns={columns} dataSource={visits} rowKey="id" loading={loading} pagination={{
        current: currentPage,
        pageSize: pageSize,
        total: totalVisits,
        onChange: (page, size) => {
          setCurrentPage(page);
          setPageSize(size);
        },
        showSizeChanger: true
      }} />
      </Card>

      <Drawer title={editingVisit ? "Edit Visit" : "Log New Visit"} placement="right" width={500} onClose={() => {
        setDrawerVisible(false);
        setEditingVisit(null);
        form.resetFields();
      }} open={drawerVisible}>
        <Form form={form} layout="vertical" onFinish={onFinish} className="compact-form">
          <Form.Item name="hospitalId" label="Hospital" rules={[{
          required: true
        }]}>
            <Select showSearch optionFilterProp="children" disabled={!!editingVisit}>
              {hospitals.map(h => <Option key={h.id} value={h.id}>{h.name}</Option>)}
            </Select>
          </Form.Item>

          {isAdmin && (
            <Form.Item name="executiveId" label="Executive" rules={[{ required: true, message: 'Please select an executive' }]}>
              <Select showSearch optionFilterProp="children" placeholder="Select Executive" disabled={!!editingVisit}>
                {executives.map(e => <Option key={e.id} value={e.id}>{e.user?.firstName} {e.user?.lastName}</Option>)}
              </Select>
            </Form.Item>
          )}

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

          <div style={{ display: 'flex', width: '100%', gap: '8px' }}>
            <Form.Item name="competitor" label="Competitor" style={{ flex: 1 }}>
              <Input placeholder="Competitors present?" />
            </Form.Item>
            
            <Form.Item name="priority" label="Priority" initialValue="Medium" style={{ flex: 1 }}>
              <Select style={{ width: '100%' }}>
                <Select.Option value="High">High</Select.Option>
                <Select.Option value="Medium">Medium</Select.Option>
                <Select.Option value="Low">Low</Select.Option>
              </Select>
            </Form.Item>
          </div>
          
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
            <Descriptions.Item label="Competitor">{selectedVisit.competitor || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Priority">
              {selectedVisit.priority ? <Tag color={selectedVisit.priority === 'High' ? 'red' : selectedVisit.priority === 'Medium' ? 'orange' : 'blue'}>{selectedVisit.priority}</Tag> : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Remarks">{selectedVisit.remarks}</Descriptions.Item>
            <Descriptions.Item label="Notes">{selectedVisit.notes}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>;
};
export default VisitsList;
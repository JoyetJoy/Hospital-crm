import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Descriptions, Tabs, Timeline, Tag, Typography, Spin, Row, Col, Space, Button, Drawer, Form, Input, DatePicker, Select, Upload, message, Switch, Modal } from 'antd';
import { EnvironmentOutlined, PhoneOutlined, MailOutlined, AppstoreOutlined, MedicineBoxOutlined, PlusOutlined, UploadOutlined, DownloadOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import api from '../../services/api';
import dayjs from 'dayjs';
const {
  Title,
  Text
} = Typography;
const { Option } = Select;
const { TextArea } = Input;
const libraries = ['drawing', 'geometry', 'places'];

const HospitalProfile = () => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_API?.split('key=')[1]?.split('&')[0] || '',
    libraries
  });
  const {
    id
  } = useParams();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [createFollowup, setCreateFollowup] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  
  const [visitModalVisible, setVisitModalVisible] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [editingVisit, setEditingVisit] = useState(null);
  
  const [quoteDrawerVisible, setQuoteDrawerVisible] = useState(false);
  const [quoteForm] = Form.useForm();
  const [quoteFileList, setQuoteFileList] = useState([]);
  
  const [selectedFollowupId, setSelectedFollowupId] = useState(null);
  useEffect(() => {
    fetchHospital();
  }, [id]);
  const fetchHospital = async () => {
    try {
      setLoading(true);
      const {
        data
      } = await api.get(`/hospitals/${id}`);
      setHospital(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async values => {
    try {
      const formData = new FormData();
      formData.append('hospitalId', id);
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
      if (values.visitLog) formData.append('visitLog', values.visitLog);

      if (editingVisit) {
        await api.put(`/visits/${editingVisit.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/visits', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (selectedFollowupId) {
        await api.put(`/followups/${selectedFollowupId}`, { status: 'Completed' });
        setSelectedFollowupId(null);
      }

      message.success(editingVisit ? 'Visit updated successfully' : 'Visit logged successfully');
      setDrawerVisible(false);
      form.resetFields();
      setFileList([]);
      setCreateFollowup(false);
      setEditingVisit(null);
      fetchHospital();
    } catch (error) {
      message.error('Failed to save visit');
    }
  };

  const handleEdit = (visit) => {
    setEditingVisit(visit);
    form.setFieldsValue({
      visitDate: dayjs(visit.visitDate),
      visitTime: visit.visitTime,
      requirement: visit.requirement,
      competitor: visit.competitor,
      visitLog: visit.visitLog,
      contactName: visit.contactName,
      contactPhone: visit.contactPhone,
      contactEmail: visit.contactEmail,
      remarks: visit.remarks,
      notes: visit.notes,
    });
    setDrawerVisible(true);
  };

  const onQuoteFinish = async values => {
    try {
      const formData = new FormData();
      formData.append('hospitalId', id);
      formData.append('date', values.date.format('YYYY-MM-DD'));
      formData.append('time', values.time || '');
      if (quoteFileList.length > 0) {
        formData.append('pdf', quoteFileList[0].originFileObj);
      } else {
        message.error('Please select a PDF file');
        return;
      }
      await api.post('/quotations', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      message.success('Quotation uploaded successfully');
      setQuoteDrawerVisible(false);
      quoteForm.resetFields();
      setQuoteFileList([]);
      fetchHospital();
    } catch (error) {
      message.error('Failed to upload quotation');
    }
  };

  const getPdfUrl = (path) => {
    if (!path) return '#';
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiUrl.replace('/api', '');
    return `${baseUrl}${path}`;
  };

  if (loading) return <div style={{
    textAlign: 'center',
    padding: 50
  }}><Spin size="large" /></div>;
  if (!hospital) return <div>Hospital not found</div>;
  return <div>
      <Card className="glass" style={{
      marginBottom: 24
    }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={3} style={{
            margin: 0
          }}>{hospital.name}</Title>
            <Space style={{
            marginTop: 8
          }}>
              <Tag color="blue">{hospital.category}</Tag>
              <Tag color={hospital.status === 'Active' ? 'green' : 'red'}>{hospital.status}</Tag>
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card title="Contact Information">
              <Descriptions column={1} colon={false} labelStyle={{ fontWeight: 500, color: '#6B7280', minWidth: '150px' }} contentStyle={{ color: '#111827' }}>
                <Descriptions.Item label={<Space><PhoneOutlined style={{ transform: 'scaleX(-1)' }} /><span>Contact Person:</span></Space>}>{hospital.contactPerson || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label={<Space><PhoneOutlined style={{ transform: 'scaleX(-1)' }} /><span>Mobile:</span></Space>}>{hospital.mobileNumber || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label={<Space><MailOutlined /><span>Email:</span></Space>}>{hospital.email || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label={<Space><EnvironmentOutlined /><span>Address:</span></Space>}>
                  {hospital.address}, {hospital.city}, {hospital.state} - {hospital.pincode}
                </Descriptions.Item>
                <Descriptions.Item label={<Space><AppstoreOutlined /><span>Departments:</span></Space>}>{hospital.department || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label={<Space><MedicineBoxOutlined /><span>Bed Count:</span></Space>}>{hospital.bedCount || 'N/A'}</Descriptions.Item>
              </Descriptions>
            </Card>

            {hospital.latitude && hospital.longitude && (
              <Card 
                title="Location" 
                extra={<Button type="link" href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`} target="_blank" rel="noopener noreferrer">Get Directions</Button>}
                styles={{ body: { padding: 0, overflow: 'hidden', borderRadius: '0 0 12px 12px' } }}
              >
                {isLoaded ? (
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '250px' }}
                    center={{ lat: hospital.latitude, lng: hospital.longitude }}
                    zoom={15}
                  >
                    <Marker position={{ lat: hospital.latitude, lng: hospital.longitude }} />
                  </GoogleMap>
                ) : (
                  <div style={{ padding: 20, textAlign: 'center' }}><Spin /></div>
                )}
              </Card>
            )}
          </Space>
        </Col>
        <Col xs={24} md={16}>
          <Card style={{
          height: '100%'
        }}>
            <Tabs defaultActiveKey="1" tabBarExtraContent={
              <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                setSelectedFollowupId(null);
                form.resetFields();
                setDrawerVisible(true);
              }}>Log Visit</Button>
            }>
              <Tabs.TabPane tab="Visits Timeline" key="1">
                {hospital.visits && hospital.visits.length > 0 ? <Timeline>
                    {hospital.visits.map(visit => <Timeline.Item key={visit.id} color="blue">
                        <Text strong>{new Date(visit.visitDate).toLocaleDateString()} {visit.visitTime ? `at ${visit.visitTime}` : ''} - {visit.requirement || 'No Requirement specified'}</Text>
                        <br />
                        <Text type="secondary">Executive: {visit.executive?.user?.firstName}</Text>
                        <br />
                        {visit.priority && <Text>Priority: <Tag color={visit.priority === 'High' ? 'red' : visit.priority === 'Medium' ? 'orange' : 'blue'}>{visit.priority}</Tag><br/></Text>}
                        {visit.remarks && <Text>Remarks: {visit.remarks}</Text>}
                        {visit.notes && <><br/><Text type="secondary">Notes: {visit.notes}</Text></>}
                        <br />
                        <Space>
                          <Button type="link" size="small" icon={<EyeOutlined />} style={{ padding: 0, marginTop: 4 }} onClick={() => {
                            setSelectedVisit(visit);
                            setVisitModalVisible(true);
                          }} />
                          <Button type="link" size="small" icon={<EditOutlined />} style={{ marginTop: 4 }} onClick={() => handleEdit(visit)} />
                        </Space>
                      </Timeline.Item>)}
                  </Timeline> : <Text>No visits recorded yet.</Text>}
              </Tabs.TabPane>
              <Tabs.TabPane tab="Pending Follow-ups" key="2">
                {hospital.followups && hospital.followups.filter(f => f.status === 'Pending').length > 0 ? <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {hospital.followups.filter(f => f.status === 'Pending').map(f => (
                      <li key={f.id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                        <div>
                          <Text strong>{new Date(f.followupDate).toLocaleDateString()} {f.followupTime ? `at ${f.followupTime}` : ''}</Text> - <Tag color="blue">{f.followupType}</Tag> ({f.priority} Priority)
                        </div>
                        {f.notes && <div style={{ color: '#666', fontSize: '13px', marginTop: 4 }}>Notes: {f.notes}</div>}
                        <div style={{ marginTop: 8 }}>
                          <Button size="small" type="primary" onClick={() => {
                            setSelectedFollowupId(f.id);
                            form.setFieldsValue({
                              requirement: f.followupType + ' Follow-up',
                              notes: f.notes
                            });
                            setDrawerVisible(true);
                          }}>Mark Done (Log Visit)</Button>
                        </div>
                      </li>
                    ))}
                  </ul> : <Text>No pending follow-ups.</Text>}
              </Tabs.TabPane>
              <Tabs.TabPane tab="Quotations" key="3">
                <Button type="dashed" block icon={<PlusOutlined />} onClick={() => setQuoteDrawerVisible(true)} style={{ marginBottom: 16 }}>
                  Upload New Quotation
                </Button>
                {hospital.quotations && hospital.quotations.length > 0 ? <ul>
                    {hospital.quotations.map(q => <li key={q.id} style={{ marginBottom: 8 }}>
                      <Text strong>{new Date(q.date).toLocaleDateString()} {q.time ? `at ${q.time}` : ''}</Text>
                      {q.pdfPath && (
                        <Button type="link" size="small" href={getPdfUrl(q.pdfPath)} target="_blank" icon={<DownloadOutlined />}>Download PDF</Button>
                      )}
                    </li>)}
                  </ul> : <Text>No quotations uploaded.</Text>}
              </Tabs.TabPane>
                </Tabs>
              </Card>
            </Col>
          </Row>

          <Drawer title={editingVisit ? "Edit Visit" : "Log New Visit"} placement="right" width={500} onClose={() => {
            setDrawerVisible(false);
            setEditingVisit(null);
            form.resetFields();
          }} open={drawerVisible}>
            <Form form={form} layout="vertical" onFinish={onFinish} className="compact-form">
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
          
          <Form.Item name="visitLog" label="Visit Log">
            <TextArea rows={2} placeholder="Detailed log of the visit..." />
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

          <Drawer title="Upload Quotation" placement="right" width={500} onClose={() => setQuoteDrawerVisible(false)} open={quoteDrawerVisible}>
            <Form form={quoteForm} layout="vertical" onFinish={onQuoteFinish}>
              <Space style={{ display: 'flex' }}>
                <Form.Item name="date" label="Date" rules={[{ required: true }]} style={{ flex: 1 }}>
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="time" label="Time" style={{ flex: 1 }}>
                  <Input type="time" />
                </Form.Item>
              </Space>
              <Form.Item label="Upload PDF" required>
                <Upload beforeUpload={() => false} accept=".pdf" fileList={quoteFileList} onChange={({ fileList: newFileList }) => setQuoteFileList(newFileList.slice(-1))} multiple={false}>
                  <Button icon={<UploadOutlined />}>Select PDF</Button>
                </Upload>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" block>Upload Quotation</Button>
              </Form.Item>
            </Form>
          </Drawer>

          <Modal title="Visit Details" open={visitModalVisible} onCancel={() => setVisitModalVisible(false)} footer={<Button onClick={() => setVisitModalVisible(false)}>Close</Button>}>
            {selectedVisit && (
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Date">{new Date(selectedVisit.visitDate).toLocaleDateString()}</Descriptions.Item>
                {selectedVisit.visitTime && <Descriptions.Item label="Time">{selectedVisit.visitTime}</Descriptions.Item>}
                <Descriptions.Item label="Requirement">{selectedVisit.requirement}</Descriptions.Item>
                <Descriptions.Item label="Contact Name">{selectedVisit.contactName || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Contact Phone">{selectedVisit.contactPhone || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Contact Email">{selectedVisit.contactEmail || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Competitor">{selectedVisit.competitor || 'None'}</Descriptions.Item>
                <Descriptions.Item label="Priority">
                  {selectedVisit.priority ? <Tag color={selectedVisit.priority === 'High' ? 'red' : selectedVisit.priority === 'Medium' ? 'orange' : 'blue'}>{selectedVisit.priority}</Tag> : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Visit Log">{selectedVisit.visitLog || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Remarks">{selectedVisit.remarks}</Descriptions.Item>
                <Descriptions.Item label="Notes">{selectedVisit.notes}</Descriptions.Item>
              </Descriptions>
            )}
          </Modal>
        </div>;
};
export default HospitalProfile;
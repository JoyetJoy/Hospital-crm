import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Row, Col, Typography, Space, Card, Drawer, Form, message } from 'antd';
import { PlusOutlined, EnvironmentOutlined, SearchOutlined } from '@ant-design/icons';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
const {
  Title
} = Typography;
const {
  Option
} = Select;
const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '12px'
};
const center = {
  lat: 20.5937,
  lng: 78.9629
};
const HospitalsList = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapVisible, setMapVisible] = useState(false);
  const [addDrawerVisible, setAddDrawerVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const {
    isLoaded
  } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_API?.split('key=')[1]?.split('&')[0] || ''
  });
  useEffect(() => {
    fetchHospitals();
  }, [searchTerm, filterCategory]);
  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const {
        data
      } = await api.get('/hospitals', {
        params: {
          search: searchTerm,
          category: filterCategory
        }
      });
      setHospitals(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const onAddFinish = async values => {
    try {
      const payload = {
        ...values,
        latitude: values.latitude ? parseFloat(values.latitude) : null,
        longitude: values.longitude ? parseFloat(values.longitude) : null
      };
      await api.post('/hospitals', payload);
      message.success('Hospital added successfully');
      setAddDrawerVisible(false);
      form.resetFields();
      fetchHospitals();
    } catch (error) {
      message.error('Failed to add hospital');
    }
  };
  const columns = [{
    title: 'Hospital Name',
    dataIndex: 'name',
    key: 'name'
  }, {
    title: 'Category',
    dataIndex: 'category',
    key: 'category'
  }, {
    title: 'City',
    dataIndex: 'city',
    key: 'city'
  }, {
    title: 'Contact Person',
    dataIndex: 'contactPerson',
    key: 'contactPerson'
  }, {
    title: 'Mobile',
    dataIndex: 'mobileNumber',
    key: 'mobileNumber'
  }, {
    title: 'Actions',
    key: 'actions',
    render: (_, record) => <Button type="link" onClick={() => navigate(`/hospitals/${record.id}`)}>View Profile</Button>
  }];
  return <div>
      <div className="page-header">
        <Title level={3} className="page-title">Hospitals Directory</Title>
        <Space>
          <Button icon={<EnvironmentOutlined />} onClick={() => setMapVisible(true)}>Map View</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddDrawerVisible(true)}>Add Hospital</Button>
        </Space>
      </div>

      <Card className="glass" style={{
      marginBottom: 24
    }}>
        <Row gutter={16}>
          <Col span={8}>
            <Input placeholder="Search by name, city, or pincode" prefix={<SearchOutlined />} onChange={e => setSearchTerm(e.target.value)} />
          </Col>
          <Col span={6}>
            <Select placeholder="Filter by Category" style={{
            width: '100%'
          }} allowClear onChange={value => setFilterCategory(value)}>
              <Option value="Government">Government</Option>
              <Option value="Private">Private</Option>
              <Option value="EHSC">EHSC</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table scroll={{
        x: 'max-content'
      }} columns={columns} dataSource={hospitals} rowKey="id" loading={loading} pagination={{
        pageSize: 10
      }} />
      </Card>

      <Drawer title="Hospital Locations" placement="right" width={800} onClose={() => setMapVisible(false)} open={mapVisible}>
        {isLoaded ? <GoogleMap mapContainerStyle={containerStyle} center={hospitals.length > 0 && hospitals[0].latitude ? {
        lat: hospitals[0].latitude,
        lng: hospitals[0].longitude
      } : center} zoom={5}>
            {hospitals.map(h => h.latitude && h.longitude && <Marker key={h.id} position={{
          lat: h.latitude,
          lng: h.longitude
        }} onClick={() => navigate(`/hospitals/${h.id}`)} />)}
          </GoogleMap> : <div>Loading Map...</div>}
      </Drawer>

      <Drawer title="Add New Hospital" placement="right" width={500} onClose={() => setAddDrawerVisible(false)} open={addDrawerVisible}>
        <Form form={form} layout="vertical" onFinish={onAddFinish}>
          <Form.Item name="name" label="Hospital Name" rules={[{
          required: true
        }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{
          required: true
        }]}>
            <Select>
              <Option value="Government">Government</Option>
              <Option value="Private">Private</Option>
              <Option value="EHSC">EHSC</Option>
            </Select>
          </Form.Item>
          <Form.Item name="department" label="Department">
            <Input placeholder="e.g. ICU, General" />
          </Form.Item>
          <Form.Item name="contactPerson" label="Contact Person">
            <Input />
          </Form.Item>
          <Form.Item name="mobileNumber" label="Mobile Number">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{
          type: 'email'
        }]}>
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Address">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="city" label="City">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="state" label="State">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="pincode" label="Pincode">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="latitude" label="Latitude">
                <Input type="number" step="any" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="longitude" label="Longitude">
                <Input type="number" step="any" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>Save Hospital</Button>
          </Form.Item>
        </Form>
      </Drawer>
    </div>;
};
export default HospitalsList;
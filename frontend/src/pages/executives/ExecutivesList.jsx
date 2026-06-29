import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Table, Button, Card, Typography, Drawer, Form, Input, Select, message, Tag, Space, Row, Col } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, LinkOutlined } from '@ant-design/icons';
import { useJsApiLoader, GoogleMap, Polygon } from '@react-google-maps/api';
import api from '../../services/api';
const {
  Title
} = Typography;
const {
  Option
} = Select;
const mapUrl = import.meta.env.VITE_GOOGLE_MAP_API || '';
const keyMatch = mapUrl.match(/key=([^&]+)/);
const googleMapsApiKey = keyMatch ? keyMatch[1] : 'AIzaSyAX_1lQpTBdnMvEOpeXdu9txMXrGU0mJy8';
const libraries = ['drawing', 'geometry', 'places'];

const mapContainerStyle = {
  width: '100%',
  height: '300px'
};
const center = { lat: 10.45, lng: 76.15 }; // Kerala default

const ExecutivesList = () => {
  const [executives, setExecutives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [polygon, setPolygon] = useState([]);
  const polygonRef = useRef(null);
  const [form] = Form.useForm();
  
  const [assignDrawerVisible, setAssignDrawerVisible] = useState(false);
  const [assignExecutive, setAssignExecutive] = useState(null);
  const [locations, setLocations] = useState({ states: [], districts: [], cities: [] });
  const [filterState, setFilterState] = useState(null);
  const [filterDistrict, setFilterDistrict] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [hospitalsLoading, setHospitalsLoading] = useState(false);
  const [selectedHospitalIds, setSelectedHospitalIds] = useState([]);
  
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey,
    libraries
  });
  useEffect(() => {
    fetchExecutives();
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const { data } = await api.get('/hospitals/locations/all');
      setLocations(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (assignDrawerVisible) {
      fetchHospitals();
    }
  }, [filterState, filterDistrict, assignDrawerVisible]);

  const fetchHospitals = async () => {
    try {
      setHospitalsLoading(true);
      const { data } = await api.get('/hospitals', {
        params: { state: filterState, district: filterDistrict }
      });
      setHospitals(data);
    } catch (e) {
      console.error(e);
    } finally {
      setHospitalsLoading(false);
    }
  };

  const openAssignDrawer = (record) => {
    setAssignExecutive(record);
    setAssignDrawerVisible(true);
    setSelectedHospitalIds([]);
    setFilterState(null);
    setFilterDistrict(null);
  };

  const handleBulkAssign = async () => {
    if (selectedHospitalIds.length === 0) {
      return message.warning('Please select at least one hospital');
    }
    try {
      await api.post(`/executives/${assignExecutive.id}/assignments/bulk`, {
        hospitalIds: selectedHospitalIds
      });
      message.success('Hospitals assigned successfully');
      setAssignDrawerVisible(false);
      setAssignExecutive(null);
      setSelectedHospitalIds([]);
    } catch (error) {
      message.error('Failed to assign hospitals');
    }
  };

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
      if (editingId) {
        await api.put(`/executives/${editingId}`, values);
        message.success('Executive updated successfully');
      } else {
        await api.post('/executives', values);
        message.success('Executive created successfully');
      }
      setDrawerVisible(false);
      setEditingId(null);
      form.resetFields();
      setPolygon([]);
      fetchExecutives();
    } catch (error) {
      message.error(editingId ? 'Failed to update executive' : 'Failed to create executive');
    }
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    form.setFieldsValue({
      firstName: record.user?.firstName,
      lastName: record.user?.lastName,
      email: record.user?.email,
      employeeCode: record.employeeCode,
      territory: record.territory
    });
    
    if (record.territory) {
      try {
        const coords = JSON.parse(record.territory);
        if (Array.isArray(coords)) {
          setPolygon(coords);
        } else {
          setPolygon([]);
        }
      } catch (e) {
        setPolygon([]);
      }
    } else {
      setPolygon([]);
    }
    
    setDrawerVisible(true);
  };

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setPolygon([]);
    setDrawerVisible(true);
  };

  const handlePolygonEdit = useCallback(() => {
    if (polygonRef.current) {
      const path = polygonRef.current.getPath();
      const coords = [];
      for (let i = 0; i < path.getLength(); i++) {
        const xy = path.getAt(i);
        coords.push({ lat: xy.lat(), lng: xy.lng() });
      }
      setPolygon(coords);
      form.setFieldsValue({ territory: JSON.stringify(coords) });
    }
  }, [form]);

  const onMapClick = useCallback((e) => {
    const newCoords = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    setPolygon(prev => {
      const updated = [...prev, newCoords];
      form.setFieldsValue({ territory: JSON.stringify(updated) });
      return updated;
    });
  }, [form]);

  const clearTerritory = () => {
    setPolygon([]);
    polygonRef.current = null;
    form.setFieldsValue({ territory: '' });
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
    key: 'territory',
    render: (_, record) => {
      if (!record.territory) return 'N/A';
      try {
        const coords = JSON.parse(record.territory);
        return Array.isArray(coords) ? 'Marked on Map' : record.territory;
      } catch(e) {
        return record.territory;
      }
    }
  }, {
    title: 'Role',
    key: 'role',
    render: (_, record) => <Tag color="geekblue">{record.user?.role?.name || 'Executive'}</Tag>
  }, {
    title: 'Action',
    key: 'action',
    render: (_, record) => (
      <Space>
        <Button type="link" icon={<LinkOutlined />} onClick={() => openAssignDrawer(record)} title="Assign Hospitals" />
        <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
      </Space>
    )
  }];
  return <div>
      <div className="page-header">
        <Title level={3} className="page-title">Executive Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Add Executive</Button>
      </div>

      <Card>
        <Table scroll={{
        x: 'max-content'
      }} columns={columns} dataSource={executives} rowKey="id" loading={loading} />
      </Card>

      <Drawer title={editingId ? "Edit Executive" : "Add New Executive"} placement="right" width={600} onClose={() => setDrawerVisible(false)} open={drawerVisible}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="password" 
                label="Password" 
                rules={[{ required: !editingId }]}
                help={editingId ? "Leave blank to keep current password" : ""}
              >
                <Input.Password />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="employeeCode" label="Employee Code">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <div style={{ marginBottom: 16 }}>
            <Typography.Text strong>Draw Territory (Click points on the map)</Typography.Text>
            <div style={{ marginTop: 8 }}>
              {isLoaded ? (
                <div style={{ position: 'relative' }}>
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={center}
                    zoom={6}
                    onClick={onMapClick}
                  >
                    {polygon.length > 0 && (
                      <Polygon
                        onLoad={(p) => { polygonRef.current = p; }}
                        onMouseUp={handlePolygonEdit}
                        onDragEnd={handlePolygonEdit}
                        path={polygon}
                        options={{
                          fillColor: '#4F46E5',
                          fillOpacity: 0.3,
                          strokeWeight: 2,
                          strokeColor: '#4F46E5',
                          clickable: true,
                          editable: true,
                          draggable: true,
                          zIndex: 1
                        }}
                      />
                    )}
                  </GoogleMap>
                  {polygon.length > 0 && (
                    <Button 
                      danger 
                      icon={<DeleteOutlined />} 
                      onClick={clearTerritory}
                      style={{ position: 'absolute', bottom: 10, left: 10, zIndex: 10 }}
                    >
                      Clear Territory
                    </Button>
                  )}
                </div>
              ) : (
                <div>Loading Map...</div>
              )}
            </div>
          </div>
          <Form.Item name="territory" label="Territory Coordinates" style={{ display: 'none' }}>
            <Input readOnly />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>{editingId ? "Update Account" : "Create Account"}</Button>
          </Form.Item>
        </Form>
      </Drawer>
      
      <Drawer
        title={`Assign Hospitals to ${assignExecutive?.user?.firstName || ''}`}
        placement="right"
        width={700}
        onClose={() => setAssignDrawerVisible(false)}
        open={assignDrawerVisible}
      >
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Select placeholder="Filter by State" style={{ width: '100%' }} allowClear value={filterState} onChange={setFilterState}>
              {locations.states.map(s => <Option key={s} value={s}>{s}</Option>)}
            </Select>
          </Col>
          <Col span={12}>
            <Select placeholder="Filter by District" style={{ width: '100%' }} allowClear value={filterDistrict} onChange={setFilterDistrict}>
              {locations.districts.map(d => <Option key={d} value={d}>{d}</Option>)}
            </Select>
          </Col>
        </Row>
        
        <Table
          rowSelection={{
            selectedRowKeys: selectedHospitalIds,
            onChange: (newSelectedRowKeys) => setSelectedHospitalIds(newSelectedRowKeys)
          }}
          columns={[
            { title: 'Hospital Name', dataIndex: 'name', key: 'name' },
            { title: 'City', dataIndex: 'city', key: 'city' },
            { title: 'District', dataIndex: 'district', key: 'district' }
          ]}
          dataSource={hospitals}
          rowKey="id"
          loading={hospitalsLoading}
          pagination={{ pageSize: 10 }}
        />
        
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Button onClick={() => setAssignDrawerVisible(false)} style={{ marginRight: 8 }}>Cancel</Button>
          <Button type="primary" onClick={handleBulkAssign} disabled={selectedHospitalIds.length === 0}>
            Assign {selectedHospitalIds.length} Hospital(s)
          </Button>
        </div>
      </Drawer>
    </div>;
};
export default ExecutivesList;
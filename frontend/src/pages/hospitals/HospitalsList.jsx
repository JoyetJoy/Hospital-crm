import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Row, Col, Typography, Space, Card, Drawer, Form, message, Upload } from 'antd';
import { PlusOutlined, EnvironmentOutlined, SearchOutlined, EditOutlined, EyeOutlined, UploadOutlined, FilterOutlined } from '@ant-design/icons';
import { GoogleMap, useJsApiLoader, Marker, StandaloneSearchBox } from '@react-google-maps/api';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import * as XLSX from 'xlsx';
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
const libraries = ['drawing', 'geometry', 'places'];
const HospitalsList = () => {
  const user = useSelector(state => state.auth.user);
  const isAdmin = user?.role === 'Super Admin' || user?.role === 'Admin' || user?.role === 'Manager';
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapVisible, setMapVisible] = useState(false);
  const [addDrawerVisible, setAddDrawerVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterState, setFilterState] = useState(null);
  const [filterDistrict, setFilterDistrict] = useState(null);
  const [filterCity, setFilterCity] = useState(null);
  const [locations, setLocations] = useState({ states: [], districts: [], cities: [] });
  const [editingHospital, setEditingHospital] = useState(null);
  const [markerPos, setMarkerPos] = useState(null);
  const [searchBox, setSearchBox] = useState(null);
  const [mapCenter, setMapCenter] = useState(center);
  const [showFilters, setShowFilters] = useState(false);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const {
    isLoaded
  } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_API?.split('key=')[1]?.split('&')[0] || '',
    libraries
  });
  useEffect(() => {
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
    fetchHospitals();
  }, [searchTerm, filterCategory, filterState, filterDistrict, filterCity]);
  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const {
        data
      } = await api.get('/hospitals', {
        params: {
          search: searchTerm,
          category: filterCategory,
          state: filterState,
          district: filterDistrict,
          city: filterCity
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
        longitude: values.longitude ? parseFloat(values.longitude) : null,
        bedCount: values.bedCount ? parseInt(values.bedCount) : null
      };
      if (editingHospital) {
        await api.put(`/hospitals/${editingHospital.id}`, payload);
        message.success('Hospital updated successfully');
      } else {
        await api.post('/hospitals', payload);
        message.success('Hospital added successfully');
      }
      closeAddDrawer();
      fetchHospitals();
    } catch (error) {
      message.error(editingHospital ? 'Failed to update hospital' : 'Failed to add hospital');
    }
  };
  const closeAddDrawer = () => {
    setAddDrawerVisible(false);
    setEditingHospital(null);
    setMarkerPos(null);
    form.resetFields();
  };
  const handleEdit = (record) => {
    setEditingHospital(record);
    form.setFieldsValue({
      name: record.name,
      category: record.category,
      department: record.department,
      contactPerson: record.contactPerson,
      mobileNumber: record.mobileNumber,
      email: record.email,
      address: record.address,
      city: record.city,
      state: record.state,
      district: record.district,
      pincode: record.pincode,
      bedCount: record.bedCount,
      latitude: record.latitude,
      longitude: record.longitude,
    });
    if (record.latitude && record.longitude) {
      const pos = { lat: record.latitude, lng: record.longitude };
      setMapCenter(pos);
      setMarkerPos(pos);
    } else {
      setMapCenter(center);
      setMarkerPos(null);
    }
    setAddDrawerVisible(true);
  };
  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const rows = json.slice(1);
        let successCount = 0;
        let errorCount = 0;
        
        message.loading({ content: 'Uploading and converting...', key: 'uploading', duration: 0 });

        const geocodeAddress = (address) => {
          return new Promise((resolve) => {
            if (!window.google) return resolve(null);
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ address }, (results, status) => {
              if (status === "OK" && results[0]) {
                const location = results[0].geometry.location;
                const lat = location.lat();
                const lng = location.lng();
                
                let city = '', state = '', district = '', pincode = '';
                let neighborhood = '', sublocality2 = '', sublocality1 = '', sublocality = '';
                
                results[0].address_components.forEach(component => {
                  if (component.types.includes('neighborhood') && !neighborhood) neighborhood = component.long_name;
                  if (component.types.includes('sublocality_level_2') && !sublocality2) sublocality2 = component.long_name;
                  if (component.types.includes('sublocality_level_1') && !sublocality1) sublocality1 = component.long_name;
                  if (component.types.includes('sublocality') && !sublocality) sublocality = component.long_name;
                  if (component.types.includes('locality') && !city) city = component.long_name;
                  if (component.types.includes('administrative_area_level_1') && !state) state = component.long_name;
                  if (component.types.includes('administrative_area_level_2') && !district) district = component.long_name;
                  else if (component.types.includes('administrative_area_level_3') && !district) district = component.long_name;
                  if (component.types.includes('postal_code') && !pincode) pincode = component.long_name;
                });
                
                const finalCity = neighborhood || sublocality2 || sublocality1 || sublocality || city;
                
                resolve({ lat, lng, city: finalCity, state, district, pincode });
              } else {
                resolve(null);
              }
            });
          });
        };

        for (const row of rows) {
          if (!row || row.length < 3) continue;
          
          let district = row[1] || '';
          const combinedCol = row[2] || '';
          const ownerCol = row[3] || '';
          const systemOfMedicine = row[4] || '';
          const standard = row[5] || '';
          const ownership = row[7] || '';
          
          const parts = combinedCol.split(',');
          const name = parts[0]?.trim() || 'Unknown';
          
          const phoneMatch = combinedCol.match(/\b\d{10,11}\b/);
          const mobileNumber = phoneMatch ? phoneMatch[0] : '';
          
          const emailMatch = combinedCol.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
          const email = emailMatch ? emailMatch[0] : '';
          
          let category = 'Private';
          if (typeof ownership === 'string' && (ownership.includes('PUB') || ownership.includes('GOVT'))) {
            category = 'Government';
          }
          
          // Parse Contact Person
          let contactPerson = '';
          const inchargeMatch = ownerCol.match(/Incharge\s*-\s*([^,]+)/i);
          if (inchargeMatch && inchargeMatch[1] && inchargeMatch[1].trim() !== '') {
            contactPerson = inchargeMatch[1].trim();
          } else {
            const ownerMatch = ownerCol.match(/Owner\s*-\s*([^,]+)/i);
            if (ownerMatch && ownerMatch[1] && ownerMatch[1].trim() !== '') {
              contactPerson = ownerMatch[1].trim();
            }
          }

          // Geocode address using Name and District
          const cleanAddress = parts.slice(0, 3).join(', ');
          const searchAddress = `${cleanAddress}, ${district}`;
          const geoData = await geocodeAddress(searchAddress);
          if (geoData) {
            await new Promise(r => setTimeout(r, 250)); // Delay to prevent OVER_QUERY_LIMIT
          }
          
          const payload = {
            name: name,
            district: geoData?.district || district,
            city: geoData?.city || '',
            state: geoData?.state || 'Kerala',
            pincode: geoData?.pincode || '',
            latitude: geoData?.lat || null,
            longitude: geoData?.lng || null,
            address: combinedCol,
            mobileNumber: mobileNumber,
            email: email,
            category: category,
            department: systemOfMedicine,
            contactPerson: contactPerson,
            notes: `Owner Details: ${ownerCol} | Standard: ${standard}`
          };

          try {
            await api.post('/hospitals', payload);
            successCount++;
          } catch (err) {
            errorCount++;
          }
        }
        
        message.success({ content: `Upload complete! Added: ${successCount}, Failed: ${errorCount}`, key: 'uploading', duration: 5 });
        fetchHospitals();
      } catch (err) {
        console.error(err);
        message.error({ content: 'Failed to process file', key: 'uploading' });
      }
    };
    reader.readAsArrayBuffer(file);
    return false;
  };
  const reverseGeocode = (lat, lng) => {
    if (!window.google) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results[0]) {
        const addressComponents = results[0].address_components;
        let city = '', state = '', district = '', pincode = '';
        let neighborhood = '', sublocality2 = '', sublocality1 = '', sublocality = '';
        
        results.forEach(result => {
          result.address_components.forEach(component => {
            if (component.types.includes('neighborhood') && !neighborhood) neighborhood = component.long_name;
            if (component.types.includes('sublocality_level_2') && !sublocality2) sublocality2 = component.long_name;
            if (component.types.includes('sublocality_level_1') && !sublocality1) sublocality1 = component.long_name;
            if (component.types.includes('sublocality') && !sublocality) sublocality = component.long_name;
            if (component.types.includes('locality') && !city) city = component.long_name;
            
            if (component.types.includes('administrative_area_level_1') && !state) {
              state = component.long_name;
            }
            if (component.types.includes('administrative_area_level_2') && !district) {
              district = component.long_name;
            } else if (component.types.includes('administrative_area_level_3') && !district) {
              district = component.long_name;
            }
            if (component.types.includes('postal_code') && !pincode) {
              pincode = component.long_name;
            }
          });
        });
        
        const finalCity = neighborhood || sublocality2 || sublocality1 || sublocality || city;
        form.setFieldsValue({
          ...(finalCity && { city: finalCity }),
          ...(state && { state: state }),
          ...(district && { district: district }),
          ...(pincode && { pincode: pincode })
        });
      }
    });
  };
  const openAddHospitalDrawer = () => {
    setAddDrawerVisible(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setMapCenter({ lat, lng });
        setMarkerPos({ lat, lng });
        form.setFieldsValue({ latitude: lat, longitude: lng });
        reverseGeocode(lat, lng);
      }, (error) => {
        console.error("Error getting location: ", error);
        message.warning("Could not get current location");
      });
    }
  };
  const onMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMarkerPos({ lat, lng });
    form.setFieldsValue({ latitude: lat, longitude: lng });
    reverseGeocode(lat, lng);
  };
  const onLoadSearchBox = ref => setSearchBox(ref);
  const onPlacesChanged = () => {
    const places = searchBox.getPlaces();
    if (places && places.length > 0) {
      const place = places[0];
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      setMapCenter({ lat, lng });
      setMarkerPos({ lat, lng });
      form.setFieldsValue({ latitude: lat, longitude: lng });
      reverseGeocode(lat, lng);
    }
  };
  const columns = [{
    title: 'Sl No',
    key: 'slNo',
    render: (_, __, index) => (tableParams.pagination.current - 1) * tableParams.pagination.pageSize + index + 1,
    width: 70
  }, {
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
    title: 'Bed Count',
    dataIndex: 'bedCount',
    key: 'bedCount',
    sorter: (a, b) => (a.bedCount || 0) - (b.bedCount || 0),
    defaultSortOrder: 'descend'
  }, {
    title: 'Visits Count',
    key: 'visitsCount',
    render: (_, record) => record._count?.visits || 0
  }, {
    title: 'Actions',
    key: 'actions',
    fixed: 'right',
    render: (_, record) => (
      <Space>
        <Button type="link" icon={<EyeOutlined />} onClick={() => navigate(`/hospitals/${record.id}`)} />
        {isAdmin && <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />}
      </Space>
    )
  }];
  return <div>
      <div className="page-header">
        <Title level={3} className="page-title">Hospitals Directory</Title>
        <Space>
          <Input 
            placeholder="Search name, city..." 
            prefix={<SearchOutlined />} 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            style={{ width: 200 }} 
            allowClear
          />
          <Button icon={<FilterOutlined />} onClick={() => setShowFilters(!showFilters)}>{showFilters ? 'Hide Filters' : 'Filters'}</Button>
          <Button icon={<EnvironmentOutlined />} onClick={() => setMapVisible(true)}>Map View</Button>
          {isAdmin && (
            <Upload beforeUpload={handleFileUpload} accept=".xlsx, .xls, .csv" showUploadList={false}>
              <Button icon={<UploadOutlined />}>Upload Excel</Button>
            </Upload>
          )}
          {isAdmin && <Button type="primary" icon={<PlusOutlined />} onClick={openAddHospitalDrawer}>Add Hospital</Button>}
        </Space>
      </div>

      <Drawer title="Filter Hospitals" placement="right" width={300} onClose={() => setShowFilters(false)} open={showFilters}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">

          <div>
            <Typography.Text strong>Category</Typography.Text>
            <Select placeholder="Select Category" style={{ width: '100%', marginTop: 8 }} allowClear value={filterCategory || undefined} onChange={setFilterCategory}>
              <Option value="Government">Government</Option>
              <Option value="Private">Private</Option>
              <Option value="EHSC">EHSC</Option>
            </Select>
          </div>
          <div>
            <Typography.Text strong>State</Typography.Text>
            <Select placeholder="Select State" style={{ width: '100%', marginTop: 8 }} allowClear value={filterState || undefined} onChange={setFilterState}>
              {locations.states.map(s => <Option key={s} value={s}>{s}</Option>)}
            </Select>
          </div>
          <div>
            <Typography.Text strong>District</Typography.Text>
            <Select placeholder="Select District" style={{ width: '100%', marginTop: 8 }} allowClear value={filterDistrict || undefined} onChange={setFilterDistrict}>
              {locations.districts.map(d => <Option key={d} value={d}>{d}</Option>)}
            </Select>
          </div>
          <div>
            <Typography.Text strong>City</Typography.Text>
            <Select placeholder="Select City" style={{ width: '100%', marginTop: 8 }} allowClear value={filterCity || undefined} onChange={setFilterCity}>
              {locations.cities.map(c => <Option key={c} value={c}>{c}</Option>)}
            </Select>
          </div>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button type="primary" block onClick={() => setShowFilters(false)}>Apply Filters</Button>
            <Button block onClick={() => {
              setSearchTerm('');
              setFilterCategory('');
              setFilterState(null);
              setFilterDistrict(null);
              setFilterCity(null);
            }}>Clear Filters</Button>
          </Space>
        </Space>
      </Drawer>

      <Card>
        <Table className="compact-table" size="small" scroll={{
        x: 'max-content'
      }} columns={columns} dataSource={hospitals} rowKey="id" loading={loading} pagination={tableParams.pagination} onChange={(pagination) => setTableParams({ pagination })} />
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

      <Drawer title={editingHospital ? "Edit Hospital" : "Add New Hospital"} placement="right" width={500} onClose={closeAddDrawer} open={addDrawerVisible}>
        <Form form={form} layout="vertical" onFinish={onAddFinish}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Hospital Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                <Select>
                  <Option value="Government">Government</Option>
                  <Option value="Private">Private</Option>
                  <Option value="EHSC">EHSC</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="department" label="Department">
                <Input placeholder="e.g. ICU, General" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="contactPerson" label="Contact Person">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="mobileNumber" label="Mobile Number">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Email" rules={[{ type: 'email' }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="address" label="Address">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="city" label="City">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="state" label="State">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="district" label="District">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="pincode" label="Pincode">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="bedCount" label="Bed Count">
                <Input type="number" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="latitude" style={{ display: 'none' }}><Input /></Form.Item>
          <Form.Item name="longitude" style={{ display: 'none' }}><Input /></Form.Item>
          
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography.Text strong>Select Location on Map</Typography.Text>
              <Button size="small" type="primary" icon={<EnvironmentOutlined />} onClick={() => {
                if ("geolocation" in navigator) {
                  navigator.geolocation.getCurrentPosition((position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setMapCenter({ lat, lng });
                    setMarkerPos({ lat, lng });
                    form.setFieldsValue({ latitude: lat, longitude: lng });
                    reverseGeocode(lat, lng);
                    message.success("Current location captured");
                  }, (error) => {
                    console.error("Error getting location: ", error);
                    message.warning("Could not get current location. Check browser permissions.");
                  });
                }
              }}>Use Current Location</Button>
            </div>
            <div style={{ marginTop: 8 }}>
              {isLoaded ? (
                <div style={{ position: 'relative' }}>
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '300px', borderRadius: '8px' }}
                    center={mapCenter}
                    zoom={12}
                    onClick={onMapClick}
                  >
                    <StandaloneSearchBox
                      onLoad={onLoadSearchBox}
                      onPlacesChanged={onPlacesChanged}
                    >
                      <input
                        type="text"
                        placeholder="Search places..."
                        style={{
                          boxSizing: `border-box`,
                          border: `1px solid transparent`,
                          width: `240px`,
                          height: `32px`,
                          padding: `0 12px`,
                          borderRadius: `3px`,
                          boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
                          fontSize: `14px`,
                          outline: `none`,
                          textOverflow: `ellipses`,
                          position: "absolute",
                          left: "50%",
                          marginLeft: "-120px",
                          top: "10px",
                        }}
                      />
                    </StandaloneSearchBox>
                    {markerPos && <Marker position={markerPos} />}
                  </GoogleMap>
                </div>
              ) : (
                <div>Loading Map...</div>
              )}
            </div>
          </div>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>Save Hospital</Button>
          </Form.Item>
        </Form>
      </Drawer>
    </div>;
};
export default HospitalsList;
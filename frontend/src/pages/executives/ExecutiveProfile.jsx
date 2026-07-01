import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Descriptions, Table, Button, Spin, message, Tag } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import api from '../../services/api';

const { Title } = Typography;

const ExecutiveProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [executive, setExecutive] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExecutive();
  }, [id]);

  const fetchExecutive = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/executives/${id}`);
      setExecutive(data);
    } catch (error) {
      console.error(error);
      message.error('Failed to load executive profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
  }

  if (!executive) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Executive not found.</div>;
  }

  const assignedHospitals = executive.assignments ? executive.assignments.map(a => a.hospital) : [];

  const columns = [
    {
      title: 'Sl No',
      key: 'slNo',
      render: (_, __, index) => index + 1,
      width: 70
    },
    {
      title: 'Hospital Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: val => <Tag color={val === 'Government' ? 'green' : val === 'EHSC' ? 'purple' : 'blue'}>{val}</Tag>
    },
    {
      title: 'City',
      dataIndex: 'city',
      key: 'city',
      render: val => val || 'N/A'
    },
    {
      title: 'District',
      dataIndex: 'district',
      key: 'district',
      render: val => val || 'N/A'
    },
    {
      title: 'Visits by Executive',
      key: 'visits',
      render: (_, record) => <Tag color="green">{record._count?.visits || 0}</Tag>
    }
  ];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/executives')} 
          style={{ marginRight: '16px', fontSize: '18px' }}
        />
        <Title level={3} className="page-title" style={{ margin: 0 }}>Executive Profile</Title>
      </div>

      <Card style={{ marginBottom: '24px' }}>
        <Descriptions title="Personal Details" bordered column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
          <Descriptions.Item label="Name">{executive.user?.firstName} {executive.user?.lastName}</Descriptions.Item>
          <Descriptions.Item label="Email">{executive.user?.email}</Descriptions.Item>
          <Descriptions.Item label="Employee Code">{executive.employeeCode || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Target">{executive.target || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Total Visits"><Tag color="green">{executive._count?.visits || 0}</Tag></Descriptions.Item>
          <Descriptions.Item label="Role">{executive.user?.role?.name || 'Executive'}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Assigned Hospitals">
        <Table 
          className="compact-table" 
          size="small" 
          scroll={{ x: 'max-content' }} 
          columns={columns} 
          dataSource={assignedHospitals} 
          rowKey="id" 
          pagination={{ pageSize: 15 }}
        />
      </Card>
    </div>
  );
};

export default ExecutiveProfile;

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Descriptions, Tabs, Timeline, Tag, Typography, Spin, Row, Col, Space } from 'antd';
import { EnvironmentOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import api from '../../services/api';
const {
  Title,
  Text
} = Typography;
const HospitalProfile = () => {
  const {
    id
  } = useParams();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
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
          <Card title="Contact Information" style={{
          height: '100%'
        }}>
            <Descriptions column={1}>
              <Descriptions.Item label={<><PhoneOutlined /> Contact Person</>}>{hospital.contactPerson || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label={<><PhoneOutlined /> Mobile</>}>{hospital.mobileNumber || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label={<><MailOutlined /> Email</>}>{hospital.email || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label={<><EnvironmentOutlined /> Address</>}>
                {hospital.address}, {hospital.city}, {hospital.state} - {hospital.pincode}
              </Descriptions.Item>
              <Descriptions.Item label="Departments">{hospital.department}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} md={16}>
          <Card style={{
          height: '100%'
        }}>
            <Tabs defaultActiveKey="1">
              <Tabs.TabPane tab="Visits Timeline" key="1">
                {hospital.visits && hospital.visits.length > 0 ? <Timeline>
                    {hospital.visits.map(visit => <Timeline.Item key={visit.id} color={visit.status === 'Order Won' ? 'green' : 'blue'}>
                        <Text strong>{new Date(visit.visitDate).toLocaleDateString()} - {visit.purpose}</Text>
                        <br />
                        <Text type="secondary">Executive: {visit.executive?.user?.firstName}</Text>
                        <br />
                        <Text>{visit.notes}</Text>
                        <div style={{
                    marginTop: 8
                  }}>
                          <Tag>{visit.status}</Tag>
                        </div>
                      </Timeline.Item>)}
                  </Timeline> : <Text>No visits recorded yet.</Text>}
              </Tabs.TabPane>
              <Tabs.TabPane tab="Pending Follow-ups" key="2">
                {/* Follow ups list */}
                {hospital.followups && hospital.followups.filter(f => f.status === 'Pending').length > 0 ? <ul>
                    {hospital.followups.filter(f => f.status === 'Pending').map(f => <li key={f.id}>{new Date(f.followupDate).toLocaleDateString()} - {f.followupType} ({f.priority} Priority)</li>)}
                  </ul> : <Text>No pending follow-ups.</Text>}
              </Tabs.TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </div>;
};
export default HospitalProfile;
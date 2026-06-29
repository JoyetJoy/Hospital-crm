import React from 'react';
import { Card, Col, Row, Statistic, Typography } from 'antd';
import { BankOutlined, ScheduleOutlined, FileDoneOutlined, RiseOutlined } from '@ant-design/icons';
const {
  Title
} = Typography;
const Dashboard = () => {
  return <div>
      <div className="page-header">
        <Title level={3} className="page-title">Dashboard Overview</Title>
      </div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Total Hospitals" value={142} prefix={<BankOutlined style={{
            color: '#4F46E5'
          }} />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Visits This Month" value={56} prefix={<ScheduleOutlined style={{
            color: '#10B981'
          }} />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Pending Follow-ups" value={12} prefix={<FileDoneOutlined style={{
            color: '#F59E0B'
          }} />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Quotations Sent" value={24} prefix={<RiseOutlined style={{
            color: '#3B82F6'
          }} />} />
          </Card>
        </Col>
      </Row>
      <div style={{
      marginTop: 24,
      padding: 24,
      background: '#fff',
      borderRadius: 12,
      minHeight: 400
    }}>
        {/* Placeholder for Charts */}
        <Title level={4}>Performance Analytics</Title>
        <p>Charts will be rendered here...</p>
      </div>
    </div>;
};
export default Dashboard;
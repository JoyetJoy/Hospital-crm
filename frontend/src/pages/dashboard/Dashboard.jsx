import React from 'react';
import { Card, Col, Row, Statistic, Typography } from 'antd';
import { BankOutlined, ScheduleOutlined, FileDoneOutlined, RiseOutlined } from '@ant-design/icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const { Title } = Typography;

const monthlyVisitsData = [
  { name: 'Jan', visits: 40 },
  { name: 'Feb', visits: 30 },
  { name: 'Mar', visits: 20 },
  { name: 'Apr', visits: 27 },
  { name: 'May', visits: 18 },
  { name: 'Jun', visits: 23 },
  { name: 'Jul', visits: 34 },
];

const categoryData = [
  { name: 'Private', value: 400 },
  { name: 'Government', value: 300 },
  { name: 'EHSC', value: 300 },
];

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

const Dashboard = () => {
  return (
    <div>
      <div className="page-header">
        <Title level={3} className="page-title">Dashboard Overview</Title>
      </div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Total Hospitals" value={142} prefix={<BankOutlined style={{ color: '#4F46E5' }} />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Visits This Month" value={56} prefix={<ScheduleOutlined style={{ color: '#10B981' }} />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Pending Follow-ups" value={12} prefix={<FileDoneOutlined style={{ color: '#F59E0B' }} />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Quotations Sent" value={24} prefix={<RiseOutlined style={{ color: '#3B82F6' }} />} />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <Card title={<span style={{ fontWeight: 600, fontSize: '16px' }}>Monthly Visits (2026)</span>} bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <div style={{ height: 320, padding: '10px 0' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyVisitsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Area type="monotone" dataKey="visits" name="Visits Logged" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card title={<span style={{ fontWeight: 600, fontSize: '16px' }}>Hospital Distribution</span>} bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    stroke="none"
                    label
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: 20 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
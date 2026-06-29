import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Typography, Tag, Space, message } from 'antd';
import { PlusOutlined, DownloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import dayjs from 'dayjs';
const {
  Title
} = Typography;
const QuotationsList = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    fetchQuotations();
  }, []);
  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const {
        data
      } = await api.get('/quotations');
      setQuotations(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const downloadPdf = async id => {
    try {
      const response = await api.get(`/quotations/${id}/pdf`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `quotation_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      message.error('Failed to download PDF');
    }
  };
  const columns = [{
    title: 'Quote No',
    dataIndex: 'quotationNumber',
    key: 'quotationNumber'
  }, {
    title: 'Date',
    dataIndex: 'date',
    key: 'date',
    render: val => dayjs(val).format('MMM DD, YYYY')
  }, {
    title: 'Hospital',
    key: 'hospital',
    render: (_, record) => record.hospital?.name
  }, {
    title: 'Total Amount',
    dataIndex: 'totalAmount',
    key: 'totalAmount',
    render: val => `₹${val.toFixed(2)}`
  }, {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: val => <Tag color={val === 'Sent' ? 'blue' : val === 'Accepted' ? 'green' : val === 'Rejected' ? 'red' : 'default'}>{val}</Tag>
  }, {
    title: 'Actions',
    key: 'actions',
    render: (_, record) => <Space>
          <Button icon={<DownloadOutlined />} size="small" onClick={() => downloadPdf(record.id)}>PDF</Button>
        </Space>
  }];
  return <div>
      <div className="page-header">
        <Title level={3} className="page-title">Quotations</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/quotations/create')}>Create Quotation</Button>
      </div>

      <Card>
        <Table scroll={{
        x: 'max-content'
      }} columns={columns} dataSource={quotations} rowKey="id" loading={loading} />
      </Card>
    </div>;
};
export default QuotationsList;
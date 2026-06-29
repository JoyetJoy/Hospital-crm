import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Typography, Tag, Space, message, Drawer, Form, Select, DatePicker, Input, Upload } from 'antd';
import { PlusOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import api from '../../services/api';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

const QuotationsList = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchQuotations();
    fetchHospitals();
  }, []);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/quotations');
      setQuotations(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHospitals = async () => {
    try {
      const { data } = await api.get('/hospitals');
      setHospitals(data);
    } catch (error) {
      console.error('Failed to fetch hospitals', error);
    }
  };

  const onFinish = async (values) => {
    try {
      const formData = new FormData();
      formData.append('hospitalId', values.hospitalId);
      formData.append('date', values.date.format('YYYY-MM-DD'));
      formData.append('time', values.time || '');
      
      if (fileList.length > 0) {
        formData.append('pdf', fileList[0].originFileObj);
      } else {
        message.error('Please select a PDF file');
        return;
      }

      await api.post('/quotations', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      message.success('Quotation uploaded successfully');
      setDrawerVisible(false);
      form.resetFields();
      setFileList([]);
      fetchQuotations();
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

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: val => dayjs(val).format('MMM DD, YYYY')
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
      render: text => text || 'N/A'
    },
    {
      title: 'Hospital',
      key: 'hospital',
      render: (_, record) => record.hospital?.name
    },
    {
      title: 'Executive',
      key: 'executive',
      render: (_, record) => record.executive?.user?.firstName || 'Unknown'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.pdfPath ? (
            <Button icon={<DownloadOutlined />} size="small" type="link" href={getPdfUrl(record.pdfPath)} target="_blank">
              View PDF
            </Button>
          ) : (
            <span style={{ color: '#999' }}>No File</span>
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      <div className="page-header">
        <Title level={3} className="page-title">Quotations</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setDrawerVisible(true)}>
          Upload Quotation
        </Button>
      </div>

      <Card>
        <Table scroll={{ x: 'max-content' }} columns={columns} dataSource={quotations} rowKey="id" loading={loading} />
      </Card>

      <Drawer title="Upload Quotation" placement="right" width={500} onClose={() => setDrawerVisible(false)} open={drawerVisible}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="hospitalId" label="Hospital" rules={[{ required: true }]}>
            <Select showSearch optionFilterProp="children">
              {hospitals.map(h => (
                <Option key={h.id} value={h.id}>{h.name}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Space style={{ display: 'flex' }}>
            <Form.Item name="date" label="Date" rules={[{ required: true }]} style={{ flex: 1 }}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="time" label="Time" style={{ flex: 1 }}>
              <Input type="time" />
            </Form.Item>
          </Space>

          <Form.Item label="Upload Quotation PDF" required>
            <Upload beforeUpload={() => false} accept=".pdf" fileList={fileList} onChange={({ fileList: newFileList }) => setFileList(newFileList.slice(-1))} multiple={false}>
              <Button icon={<UploadOutlined />}>Select PDF</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>Save Quotation</Button>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default QuotationsList;
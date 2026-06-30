import React, { useState, useEffect } from 'react';
import { Card, Form, Select, Button, DatePicker, Table, InputNumber, Typography, Row, Col, message, Divider } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
const {
  Title,
  Text
} = Typography;
const {
  Option
} = Select;
const CreateQuotation = () => {
  const [hospitals, setHospitals] = useState([]);
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  useEffect(() => {
    fetchHospitals();
    fetchProducts();
  }, []);
  const fetchHospitals = async () => {
    const {
      data
    } = await api.get('/hospitals');
    setHospitals(data);
  };
  const fetchProducts = async () => {
    const {
      data
    } = await api.get('/products');
    setProducts(data);
  };
  const addItem = productId => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    if (items.find(i => i.productId === productId)) {
      message.warning('Product already added');
      return;
    }
    setItems([...items, {
      productId,
      name: product.productName,
      price: product.price,
      gst: product.gst,
      quantity: 1,
      discount: 0,
      total: product.price + product.price * product.gst / 100
    }]);
  };
  const updateItem = (productId, field, value) => {
    setItems(items.map(item => {
      if (item.productId === productId) {
        const updated = {
          ...item,
          [field]: value
        };
        const subtotal = updated.price * updated.quantity;
        const discountAmount = updated.discount;
        const afterDiscount = subtotal - discountAmount;
        updated.total = afterDiscount + afterDiscount * updated.gst / 100;
        return updated;
      }
      return item;
    }));
  };
  const removeItem = productId => {
    setItems(items.filter(i => i.productId !== productId));
  };
  const calculateGrandTotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };
  const onFinish = async values => {
    if (items.length === 0) {
      message.error('Please add at least one product');
      return;
    }
    try {
      const payload = {
        hospitalId: values.hospitalId,
        validTill: values.validTill.format('YYYY-MM-DD'),
        items: items.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.price,
          gst: i.gst,
          discount: i.discount,
          total: i.total
        })),
        totalAmount: calculateGrandTotal()
      };
      await api.post('/quotations', payload);
      message.success('Quotation created successfully');
      navigate('/quotations');
    } catch (error) {
      message.error('Failed to create quotation');
    }
  };
  const columns = [{
    title: 'Sl No',
    key: 'slNo',
    render: (_, __, index) => index + 1,
    width: 70
  }, {
    title: 'Product',
    dataIndex: 'name',
    key: 'name'
  }, {
    title: 'Price (₹)',
    dataIndex: 'price',
    key: 'price',
    render: (val, record) => <InputNumber value={val} onChange={v => updateItem(record.productId, 'price', v || 0)} />
  }, {
    title: 'Qty',
    dataIndex: 'quantity',
    key: 'quantity',
    render: (val, record) => <InputNumber min={1} value={val} onChange={v => updateItem(record.productId, 'quantity', v || 1)} />
  }, {
    title: 'Discount (₹)',
    dataIndex: 'discount',
    key: 'discount',
    render: (val, record) => <InputNumber min={0} value={val} onChange={v => updateItem(record.productId, 'discount', v || 0)} />
  }, {
    title: 'GST (%)',
    dataIndex: 'gst',
    key: 'gst'
  }, {
    title: 'Total (₹)',
    dataIndex: 'total',
    key: 'total',
    render: val => val.toFixed(2)
  }, {
    title: '',
    key: 'action',
    render: (_, record) => <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeItem(record.productId)} />
  }];
  return <div>
      <div className="page-header">
        <Title level={3} className="page-title">Create Quotation</Title>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Card className="glass" style={{
        marginBottom: 24
      }}>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item name="hospitalId" label="Select Hospital" rules={[{
              required: true
            }]}>
                <Select showSearch placeholder="Search hospital">
                  {hospitals.map(h => <Option key={h.id} value={h.id}>{h.name}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="validTill" label="Valid Until" rules={[{
              required: true
            }]}>
                <DatePicker style={{
                width: '100%'
              }} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title="Products" extra={<Select placeholder="Add a product..." style={{
        width: 300
      }} onChange={addItem} value={null}>
            {products.map(p => <Option key={p.id} value={p.id}>{p.productName} - ₹{p.price}</Option>)}
          </Select>}>
          <Table className="compact-table" size="small" scroll={{
          x: 'max-content'
        }} columns={columns} dataSource={items} rowKey="productId" pagination={false} />
          <Divider />
          <Row justify="end">
            <Col span={8} style={{
            textAlign: 'right'
          }}>
              <Title level={4}>Grand Total: ₹{calculateGrandTotal().toFixed(2)}</Title>
              <Button type="primary" size="large" htmlType="submit" style={{
              marginTop: 16
            }}>Generate Quotation</Button>
            </Col>
          </Row>
        </Card>
      </Form>
    </div>;
};
export default CreateQuotation;
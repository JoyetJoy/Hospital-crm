import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Typography, Space, Drawer, Form, Input, InputNumber, Select, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../services/api';
const {
  Title
} = Typography;
const {
  Option
} = Select;
const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  useEffect(() => {
    fetchProducts();
  }, []);
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const {
        data
      } = await api.get('/products');
      setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const onFinish = async values => {
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, values);
        message.success('Product updated');
      } else {
        await api.post('/products', values);
        message.success('Product added');
      }
      setDrawerVisible(false);
      form.resetFields();
      setEditingId(null);
      fetchProducts();
    } catch (error) {
      message.error('Operation failed');
    }
  };
  const editProduct = record => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setDrawerVisible(true);
  };
  const deleteProduct = async id => {
    try {
      await api.delete(`/products/${id}`);
      message.success('Product deleted');
      fetchProducts();
    } catch (error) {
      message.error('Failed to delete');
    }
  };
  const columns = [{
    title: 'Sl No',
    key: 'slNo',
    render: (_, __, index) => index + 1,
    width: 70
  }, {
    title: 'SKU',
    dataIndex: 'sku',
    key: 'sku'
  }, {
    title: 'Product Name',
    dataIndex: 'productName',
    key: 'productName'
  }, {
    title: 'Category',
    dataIndex: 'category',
    key: 'category'
  }, {
    title: 'Price',
    dataIndex: 'price',
    key: 'price',
    render: val => `₹${val.toFixed(2)}`
  }, {
    title: 'GST (%)',
    dataIndex: 'gst',
    key: 'gst'
  }, {
    title: 'Actions',
    key: 'actions',
    render: (_, record) => <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => editProduct(record)} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => deleteProduct(record.id)} />
        </Space>
  }];
  return <div>
      <div className="page-header">
        <Title level={3} className="page-title">Product Catalog</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => {
        setEditingId(null);
        form.resetFields();
        setDrawerVisible(true);
      }}>Add Product</Button>
      </div>

      <Card>
        <Table className="compact-table" size="small" scroll={{
        x: 'max-content'
      }} columns={columns} dataSource={products} rowKey="id" loading={loading} />
      </Card>

      <Drawer title={editingId ? "Edit Product" : "Add Product"} placement="right" width={400} onClose={() => setDrawerVisible(false)} open={drawerVisible}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="sku" label="SKU" rules={[{
          required: true
        }]}>
            <Input />
          </Form.Item>
          <Form.Item name="productName" label="Product Name" rules={[{
          required: true
        }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{
          required: true
        }]}>
            <Select>
              <Option value="Hospital Beds">Hospital Beds</Option>
              <Option value="ICU Beds">ICU Beds</Option>
              <Option value="Wheelchairs">Wheelchairs</Option>
              <Option value="Stretchers">Stretchers</Option>
              <Option value="Examination Tables">Examination Tables</Option>
            </Select>
          </Form.Item>
          <Form.Item name="price" label="Base Price" rules={[{
          required: true
        }]}>
            <InputNumber style={{
            width: '100%'
          }} />
          </Form.Item>
          <Form.Item name="gst" label="GST (%)" rules={[{
          required: true
        }]}>
            <InputNumber style={{
            width: '100%'
          }} />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>{editingId ? 'Update' : 'Save'}</Button>
          </Form.Item>
        </Form>
      </Drawer>
    </div>;
};
export default ProductsList;
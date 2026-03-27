import { useMemo, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Select, Switch, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import {
  useGetListedProductsQuery, useCreateListedProductMutation, useUpdateListedProductMutation,
  useDeleteListedProductMutation, useGetProductTypesQuery,
} from '../api/adminApi';

export default function ListedProducts() {
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { data: resp, isLoading } = useGetListedProductsQuery();
  const { data: ptResp } = useGetProductTypesQuery();
  const [createItem, { isLoading: creating }] = useCreateListedProductMutation();
  const [updateItem, { isLoading: updating }] = useUpdateListedProductMutation();
  const [deleteItem] = useDeleteListedProductMutation();
  const list = resp?.data ?? resp ?? [];
  const productTypes = ptResp?.data ?? ptResp ?? [];

  const filtered = useMemo(() => {
    const t = searchText.trim().toLowerCase();
    return (Array.isArray(list) ? list : []).filter((r) => !t || String(r.name || '').toLowerCase().includes(t));
  }, [list, searchText]);

  const openCreate = () => { setEditing(null); form.resetFields(); form.setFieldsValue({ is_best_seller: false, sort_order: 0, is_active: true }); setModalOpen(true); };
  const openEdit = (row) => {
    setEditing(row);
    form.setFieldsValue({
      product_type_id: row.product_type_id,
      name: row.name,
      description: row.description,
      admin_price: Number(row.admin_price || 0),
      is_best_seller: !!row.is_best_seller,
      sort_order: Number(row.sort_order || 0),
      is_active: !!row.is_active,
    });
    setModalOpen(true);
  };
  const submit = async () => {
    try {
      const v = await form.validateFields();
      if (editing) await updateItem({ id: editing.id, ...v }).unwrap();
      else await createItem(v).unwrap();
      message.success(editing ? 'Listed product updated' : 'Listed product created');
      setModalOpen(false);
    } catch (e) { message.error(e?.data?.message || e?.message || 'Operation failed'); }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>Listed Products</h2>
        <Space>
          <Input allowClear prefix={<SearchOutlined />} placeholder="Search listed product" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add Listed Product</Button>
        </Space>
      </div>
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={filtered}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 70 },
          { title: 'Name', dataIndex: 'name' },
          { title: 'Product Type', dataIndex: 'product_type_id', width: 120 },
          { title: 'Admin Price (₹)', dataIndex: 'admin_price', width: 130, render: (v) => Number(v || 0).toFixed(2) },
          { title: 'Best Seller', dataIndex: 'is_best_seller', width: 100, render: (v) => (v ? 'Yes' : 'No') },
          { title: 'Active', dataIndex: 'is_active', width: 90, render: (v) => (v ? 'Yes' : 'No') },
          {
            title: 'Actions', width: 110, render: (_, row) => (
              <Space>
                <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(row)} />
                <Popconfirm title="Delete?" onConfirm={() => deleteItem(row.id).unwrap().then(() => message.success('Deleted')).catch(() => message.error('Delete failed'))}>
                  <Button type="link" danger size="small" icon={<DeleteOutlined />} />
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />
      <Modal title={editing ? 'Edit Listed Product' : 'Create Listed Product'} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={submit} confirmLoading={creating || updating}>
        <Form form={form} layout="vertical">
          <Form.Item name="product_type_id" label="Product Type" rules={[{ required: true }]}><Select options={(Array.isArray(productTypes) ? productTypes : []).map((p) => ({ label: p.name, value: p.id }))} /></Form.Item>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="Description"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="admin_price" label="Admin Price (₹)" rules={[{ required: true }]}><InputNumber min={0} step={0.01} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="is_best_seller" label="Best Seller" valuePropName="checked"><Switch /></Form.Item>
          <Form.Item name="sort_order" label="Sort Order"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="is_active" label="Active" valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}

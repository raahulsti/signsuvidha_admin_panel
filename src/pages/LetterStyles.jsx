import { useMemo, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Select, Switch, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import {
  useGetLetterStylesQuery, useCreateLetterStyleMutation, useUpdateLetterStyleMutation,
  useDeleteLetterStyleMutation, useGetProductTypesQuery,
} from '../api/adminApi';

export default function LetterStyles() {
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { data: resp, isLoading } = useGetLetterStylesQuery();
  const { data: ptResp } = useGetProductTypesQuery();
  const [createItem, { isLoading: creating }] = useCreateLetterStyleMutation();
  const [updateItem, { isLoading: updating }] = useUpdateLetterStyleMutation();
  const [deleteItem] = useDeleteLetterStyleMutation();
  const list = resp?.data ?? resp ?? [];
  const productTypes = ptResp?.data ?? ptResp ?? [];

  const filtered = useMemo(() => {
    const t = searchText.trim().toLowerCase();
    return (Array.isArray(list) ? list : []).filter((r) => !t || String(r.name || '').toLowerCase().includes(t));
  }, [list, searchText]);

  const openCreate = () => { setEditing(null); form.resetFields(); form.setFieldsValue({ price_multiplier: 1, admin_price_extra: 0, is_active: true }); setModalOpen(true); };
  const openEdit = (row) => { setEditing(row); form.setFieldsValue({ product_type_id: row.product_type_id, name: row.name, price_multiplier: Number(row.price_multiplier || 1), admin_price_extra: Number(row.admin_price_extra || 0), is_active: !!row.is_active }); setModalOpen(true); };
  const submit = async () => {
    try {
      const v = await form.validateFields();
      if (editing) await updateItem({ id: editing.id, ...v }).unwrap();
      else await createItem(v).unwrap();
      message.success(editing ? 'Letter style updated' : 'Letter style created');
      setModalOpen(false);
    } catch (e) { message.error(e?.data?.message || e?.message || 'Operation failed'); }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>Letter Styles</h2>
        <Space>
          <Input allowClear prefix={<SearchOutlined />} placeholder="Search letter style" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add Letter Style</Button>
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
          { title: 'Multiplier', dataIndex: 'price_multiplier', width: 110 },
          { title: 'Price Extra (₹)', dataIndex: 'admin_price_extra', width: 120 },
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
      <Modal title={editing ? 'Edit Letter Style' : 'Create Letter Style'} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={submit} confirmLoading={creating || updating}>
        <Form form={form} layout="vertical">
          <Form.Item name="product_type_id" label="Product Type" rules={[{ required: true }]}><Select options={(Array.isArray(productTypes) ? productTypes : []).map((p) => ({ label: p.name, value: p.id }))} /></Form.Item>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="price_multiplier" label="Price Multiplier"><InputNumber min={0.1} max={10} step={0.01} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="admin_price_extra" label="Price Extra (₹)"><InputNumber min={0} step={0.01} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="is_active" label="Active" valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}

import { useMemo, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Select, Switch, /* Popconfirm, */ message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, /* DeleteOutlined, */ SearchOutlined } from '@ant-design/icons';
import {
  useGetAddBordersQuery,
  useCreateAddBorderMutation,
  useUpdateAddBorderMutation,
  // useDeleteAddBorderMutation, // Delete disabled — use is_active instead to preserve cart/order references
} from '../api/adminApi';

const SHAPES = [
  { value: 'circle', label: 'Circle' },
  { value: 'oval', label: 'Oval' },
  { value: 'square', label: 'Square' },
];
const SIZES = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

export default function AddBorders() {
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  const { data: resp, isLoading } = useGetAddBordersQuery({ page: 1, limit: 200 });
  const [createRow, { isLoading: creating }] = useCreateAddBorderMutation();
  const [updateRow, { isLoading: updating }] = useUpdateAddBorderMutation();
  // Delete disabled — use is_active instead to preserve cart/order references
  // const [deleteRow] = useDeleteAddBorderMutation();

  const rows = resp?.data ?? resp ?? [];

  const filteredData = useMemo(() => {
    const term = searchText.trim().toLowerCase();
    return (Array.isArray(rows) ? rows : []).filter((row) => {
      if (!term) return true;
      return [row.height, row.width, row.shape, row.size].some((v) =>
        String(v || '').toLowerCase().includes(term)
      );
    });
  }, [rows, searchText]);

  const openCreate = () => {
    setEditingRow(null);
    form.resetFields();
    form.setFieldsValue({ product_type_id: 6, is_active: true, sort_order: 0 });
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingRow(row);
    form.setFieldsValue({
      product_type_id: row.product_type_id,
      shape: row.shape,
      size: row.size,
      height: row.height,
      width: row.width,
      admin_price: Number(row.admin_price || 0),
      lit_price: Number(row.lit_price || 0),
      sort_order: Number(row.sort_order || 0),
      is_active: !!row.is_active,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const body = {
        ...values,
        product_type_id: 6,
      };
      if (editingRow) {
        await updateRow({ id: editingRow.id, body }).unwrap();
        message.success('Updated');
      } else {
        await createRow(body).unwrap();
        message.success('Created');
      }
      setModalOpen(false);
    } catch (err) {
      message.error(err?.data?.message || err?.message || 'Failed');
    }
  };

  const columns = [
    { title: 'Shape', dataIndex: 'shape', render: (v) => <Tag>{v}</Tag> },
    { title: 'Size', dataIndex: 'size', render: (v) => <Tag>{v}</Tag> },
    { title: 'Height', dataIndex: 'height', render: (v) => v || '-' },
    { title: 'Width', dataIndex: 'width', render: (v) => v || '-' },
    { title: 'Price (₹)', dataIndex: 'admin_price', render: (v) => Number(v || 0).toFixed(2) },
    { title: 'Lit add-on (₹)', dataIndex: 'lit_price', render: (v) => Number(v || 0).toFixed(2) },
    {
      title: 'Status',
      dataIndex: 'is_active',
      render: (v) => (v ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>),
    },
    {
      title: 'Actions',
      render: (_, row) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(row)} />
          {/* Delete disabled — use is_active instead to preserve cart/order references
          <Popconfirm title="Delete?" onConfirm={async () => { await deleteRow(row.id).unwrap(); message.success('Deleted'); }}>
            <Button type="link" danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
          */}
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ margin: 0 }}>Add Borders (Lollipop)</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add option</Button>
      </div>
      <Input allowClear prefix={<SearchOutlined />} placeholder="Search shape / size / height / width" style={{ width: 320, marginBottom: 12 }} value={searchText} onChange={(e) => setSearchText(e.target.value)} />
      <Table rowKey="id" loading={isLoading} dataSource={filteredData} columns={columns} pagination={false} />

      <Modal title={editingRow ? 'Edit add border' : 'Create add border'} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={handleSubmit} confirmLoading={creating || updating}>
        <Form form={form} layout="vertical">
          <Form.Item name="shape" label="Shape" rules={[{ required: true }]}>
            <Select options={SHAPES} />
          </Form.Item>
          <Form.Item name="size" label="Size" rules={[{ required: true }]}>
            <Select options={SIZES} />
          </Form.Item>
          <Form.Item name="height" label="Height">
            <Input placeholder="e.g. 12 inch" />
          </Form.Item>
          <Form.Item name="width" label="Width">
            <Input placeholder="e.g. 8 inch" />
          </Form.Item>
          <Form.Item name="admin_price" label="Base price (₹)" rules={[{ required: true }]}>
            <InputNumber min={0} step={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="lit_price" label="Lit add-on (₹) — added to base when lit" rules={[{ required: true }]}>
            <InputNumber min={0} step={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="sort_order" label="Sort order" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="is_active" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

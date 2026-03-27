import { useMemo, useState } from 'react';
import {
  Table, Button, Space, Modal, Form, Input, InputNumber, Select,
  Switch, Popconfirm, message, Tag, Upload,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, UploadOutlined,
} from '@ant-design/icons';
import {
  useGetElementsQuery, useCreateElementMutation, useUpdateElementMutation,
  useDeleteElementMutation, useGetProductTypesQuery,
} from '../api/adminApi';

export default function Elements() {
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [productTypeFilter, setProductTypeFilter] = useState();
  const { data: elementsResp, isLoading } = useGetElementsQuery({ page: 1, limit: 200 });
  const { data: productTypesResp } = useGetProductTypesQuery();
  const [createItem, { isLoading: creating }] = useCreateElementMutation();
  const [updateItem, { isLoading: updating }] = useUpdateElementMutation();
  const [deleteItem] = useDeleteElementMutation();

  const elements = elementsResp?.data ?? elementsResp ?? [];
  const productTypes = productTypesResp?.data ?? productTypesResp ?? [];

  const filtered = useMemo(() => {
    const term = searchText.trim().toLowerCase();
    return (Array.isArray(elements) ? elements : []).filter((r) => {
      const s = !term || String(r.name || '').toLowerCase().includes(term) || String(r.product_type_name || '').toLowerCase().includes(term);
      const f = !productTypeFilter || String(r.product_type_id) === String(productTypeFilter);
      return s && f;
    });
  }, [elements, productTypeFilter, searchText]);

  const openCreate = () => {
    setEditingRow(null);
    form.resetFields();
    form.setFieldsValue({ is_active: true, sort_order: 0, admin_price_extra: 0 });
    setModalOpen(true);
  };
  const openEdit = (row) => {
    setEditingRow(row);
    form.setFieldsValue({
      product_type_id: row.product_type_id,
      element_type_id: row.element_type_id,
      name: row.name,
      description: row.description,
      admin_price_extra: Number(row.admin_price_extra || 0),
      sort_order: Number(row.sort_order || 0),
      is_active: !!row.is_active,
    });
    setModalOpen(true);
  };

  const buildFD = (v, imageRequired = false) => {
    const fd = new FormData();
    ['product_type_id', 'element_type_id', 'name', 'description', 'admin_price_extra', 'sort_order'].forEach((k) => {
      if (v[k] !== undefined && v[k] !== null) fd.append(k, String(v[k]));
    });
    fd.append('is_active', v.is_active ? 'true' : 'false');
    const image = v.image?.[0]?.originFileObj;
    if (image) fd.append('image', image);
    else if (imageRequired) throw new Error('Image is required');
    return fd;
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingRow) await updateItem({ id: editingRow.id, body: buildFD(values) }).unwrap();
      else await createItem(buildFD(values, true)).unwrap();
      message.success(editingRow ? 'Element updated' : 'Element created');
      setModalOpen(false);
      form.resetFields();
    } catch (err) {
      message.error(err?.data?.message || err?.message || 'Operation failed');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 70 },
    { title: 'Name', dataIndex: 'name' },
    { title: 'Product Type', dataIndex: 'product_type_name', width: 160 },
    { title: 'Element Type ID', dataIndex: 'element_type_id', width: 130 },
    { title: 'Price Extra (₹)', dataIndex: 'admin_price_extra', width: 130, render: (v) => Number(v || 0).toFixed(2) },
    { title: 'Status', dataIndex: 'is_active', width: 100, render: (v) => (v ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>) },
    {
      title: 'Actions', width: 110, render: (_, row) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(row)} />
          <Popconfirm title="Delete element?" onConfirm={() => deleteItem(row.id).unwrap().then(() => message.success('Deleted')).catch(() => message.error('Delete failed'))}>
            <Button type="link" danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>Elements</h2>
        <Space wrap>
          <Input allowClear prefix={<SearchOutlined />} placeholder="Search element" style={{ width: 240 }} value={searchText} onChange={(e) => setSearchText(e.target.value)} />
          <Select allowClear placeholder="Filter product type" style={{ width: 220 }} value={productTypeFilter} onChange={setProductTypeFilter}
            options={(Array.isArray(productTypes) ? productTypes : []).map((p) => ({ label: p.name, value: p.id }))}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add Element</Button>
        </Space>
      </div>
      <Table rowKey="id" loading={isLoading} dataSource={filtered} columns={columns} />

      <Modal title={editingRow ? 'Edit Element' : 'Create Element'} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={handleSubmit} confirmLoading={creating || updating}>
        <Form form={form} layout="vertical">
          <Form.Item name="product_type_id" label="Product Type" rules={[{ required: true }]}><Select options={(Array.isArray(productTypes) ? productTypes : []).map((p) => ({ label: p.name, value: p.id }))} /></Form.Item>
          <Form.Item name="element_type_id" label="Element Type ID" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="Description"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="admin_price_extra" label="Price Extra (₹)"><InputNumber min={0} step={0.01} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="sort_order" label="Sort Order"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="is_active" label="Active" valuePropName="checked"><Switch /></Form.Item>
          <Form.Item name="image" label={editingRow ? 'Image (optional)' : 'Image'} rules={editingRow ? [] : [{ required: true, message: 'Image required' }]} valuePropName="fileList" getValueFromEvent={(e) => e?.fileList}>
            <Upload beforeUpload={() => false} maxCount={1} accept="image/*"><Button icon={<UploadOutlined />}>Choose Image</Button></Upload>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

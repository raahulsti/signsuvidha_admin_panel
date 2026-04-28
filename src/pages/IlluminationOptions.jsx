import { useMemo, useState } from 'react';
import {
  Table, Button, Space, Modal, Form, Input, InputNumber, Select,
  Switch, Popconfirm, message, Tag, Upload, Image,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, UploadOutlined,
} from '@ant-design/icons';
import {
  useGetIlluminationOptionsQuery,
  useGetProductTypesQuery,
  useCreateIlluminationOptionMutation,
  useUpdateIlluminationOptionMutation,
  useDeleteIlluminationOptionMutation,
} from '../api/adminApi';

const CATEGORY_LABELS = { lit: 'Lit', non_lit: 'Non-Lit' };

export default function IlluminationOptions() {
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [productTypeFilter, setProductTypeFilter] = useState();
  const [categoryFilter, setCategoryFilter] = useState();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  const { data: listResp, isLoading } = useGetIlluminationOptionsQuery({});
  const { data: productTypesResp } = useGetProductTypesQuery();
  const [createItem, { isLoading: creating }] = useCreateIlluminationOptionMutation();
  const [updateItem, { isLoading: updating }] = useUpdateIlluminationOptionMutation();
  const [deleteItem] = useDeleteIlluminationOptionMutation();

  const rows = listResp?.data ?? listResp ?? [];
  const productTypes = productTypesResp?.data ?? productTypesResp ?? [];

  const filtered = useMemo(() => {
    const term = searchText.trim().toLowerCase();
    return (Array.isArray(rows) ? rows : []).filter((r) => {
      const okSearch =
        !term ||
        String(r.name || '').toLowerCase().includes(term) ||
        String(r.description || '').toLowerCase().includes(term);
      const okPt = !productTypeFilter || String(r.product_type_id) === String(productTypeFilter);
      const okCat = !categoryFilter || r.category === categoryFilter;
      return okSearch && okPt && okCat;
    });
  }, [rows, productTypeFilter, categoryFilter, searchText]);

  const openCreate = () => {
    setEditingRow(null);
    form.resetFields();
    form.setFieldsValue({ is_active: true, sort_order: 0, category: 'lit' });
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingRow(row);
    form.setFieldsValue({
      product_type_id: row.product_type_id,
      category: row.category,
      name: row.name,
      description: row.description,
      admin_price_per_sqft: Number(row.admin_price_per_sqft || 0),
      sort_order: Number(row.sort_order || 0),
      is_active: !!row.is_active,
    });
    setModalOpen(true);
  };

  const buildFD = (v) => {
    const fd = new FormData();
    fd.append('product_type_id', String(v.product_type_id));
    fd.append('category', v.category);
    fd.append('name', v.name);
    fd.append('description', v.description || '');
    fd.append('admin_price_per_sqft', String(v.admin_price_per_sqft));
    fd.append('sort_order', String(v.sort_order ?? 0));
    fd.append('is_active', v.is_active ? 'true' : 'false');
    const img = v.image?.[0]?.originFileObj;
    if (img) fd.append('image', img);
    return fd;
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const fd = buildFD(values);
      if (editingRow) await updateItem({ id: editingRow.id, body: fd }).unwrap();
      else await createItem(fd).unwrap();
      message.success(editingRow ? 'Updated' : 'Created');
      setModalOpen(false);
      form.resetFields();
    } catch (err) {
      message.error(err?.data?.message || err?.message || 'Failed');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 70 },
    {
      title: 'Product',
      dataIndex: 'product_type_name',
      width: 140,
      render: (_, row) => row.product_type_name || '-',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      width: 100,
      render: (c) => <Tag color={c === 'lit' ? 'gold' : 'default'}>{CATEGORY_LABELS[c] || c}</Tag>,
    },
    { title: 'Name', dataIndex: 'name' },
    {
      title: 'Image',
      dataIndex: 'preview_image_url',
      width: 80,
      render: (url) => (url ? <Image src={url} width={44} height={44} style={{ objectFit: 'cover', borderRadius: 6 }} /> : '-'),
    },
    {
      title: 'Admin ₹/sq ft',
      dataIndex: 'admin_price_per_sqft',
      width: 120,
      render: (v) => `₹${Number(v || 0).toFixed(2)}`,
    },
    { title: 'Sort', dataIndex: 'sort_order', width: 70 },
    {
      title: 'Status',
      dataIndex: 'is_active',
      width: 90,
      render: (v) => (v ? <Tag color="green">Active</Tag> : <Tag color="red">Off</Tag>),
    },
    {
      title: 'Actions',
      width: 110,
      render: (_, row) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(row)} />
          <Popconfirm title="Delete?" onConfirm={() => deleteItem(row.id).unwrap().then(() => message.success('Deleted')).catch(() => message.error('Failed'))}>
            <Button type="link" danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>Lit / Non-Lit options</h2>
        <Space wrap>
          <Input allowClear prefix={<SearchOutlined />} placeholder="Search name / description" style={{ width: 220 }} value={searchText} onChange={(e) => setSearchText(e.target.value)} />
          <Select allowClear placeholder="Product type" style={{ width: 180 }} value={productTypeFilter} onChange={setProductTypeFilter}
            options={(Array.isArray(productTypes) ? productTypes : []).map((p) => ({ label: p.name, value: p.id }))} />
          <Select allowClear placeholder="Category" style={{ width: 140 }} value={categoryFilter} onChange={setCategoryFilter}
            options={[{ label: 'Lit', value: 'lit' }, { label: 'Non-Lit', value: 'non_lit' }]} />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add option</Button>
        </Space>
      </div>
      <Table rowKey="id" loading={isLoading} dataSource={filtered} columns={columns} />

      <Modal title={editingRow ? 'Edit option' : 'Add option'} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={handleSubmit} confirmLoading={creating || updating} width={560}>
        <Form form={form} layout="vertical">
          <Form.Item name="product_type_id" label="Product type" rules={[{ required: true }]}>
            <Select
              placeholder="Select product type"
              options={(Array.isArray(productTypes) ? productTypes : []).map((p) => ({ label: p.name, value: p.id }))}
            />
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select options={[{ label: 'Lit', value: 'lit' }, { label: 'Non-Lit', value: 'non_lit' }]} />
          </Form.Item>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. LED Front Lit" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Short description for customer UI" />
          </Form.Item>
          <Form.Item name="admin_price_per_sqft" label="Admin price (₹ per sq ft)" rules={[{ required: true }]}>
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="sort_order" label="Sort order">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="is_active" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="image" label={editingRow ? 'Image (optional)' : 'Preview image'} valuePropName="fileList" getValueFromEvent={(e) => e?.fileList}>
            <Upload beforeUpload={() => false} maxCount={1} accept="image/*">
              <Button icon={<UploadOutlined />}>Choose image</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

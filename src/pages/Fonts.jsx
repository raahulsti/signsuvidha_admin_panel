import { useMemo, useState } from 'react';
import {
  Table, Button, Space, Modal, Form, Input, InputNumber, Select,
  Switch, Popconfirm, message, Tag, Upload,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, UploadOutlined,
} from '@ant-design/icons';
import {
  useGetFontsQuery, useCreateFontMutation, useUpdateFontMutation,
  useDeleteFontMutation, useGetProductTypesQuery,
} from '../api/adminApi';

export default function Fonts() {
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const { data: fontsResp, isLoading } = useGetFontsQuery();
  const { data: productTypesResp } = useGetProductTypesQuery();
  const [createItem, { isLoading: creating }] = useCreateFontMutation();
  const [updateItem, { isLoading: updating }] = useUpdateFontMutation();
  const [deleteItem] = useDeleteFontMutation();

  const fonts = fontsResp?.data ?? fontsResp ?? [];
  const productTypes = productTypesResp?.data ?? productTypesResp ?? [];
  const filtered = useMemo(() => {
    const term = searchText.trim().toLowerCase();
    return (Array.isArray(fonts) ? fonts : []).filter((r) => !term || String(r.name || '').toLowerCase().includes(term));
  }, [fonts, searchText]);

  const openCreate = () => {
    setEditingRow(null);
    form.resetFields();
    form.setFieldsValue({ is_active: true, sort_order: 0 });
    setModalOpen(true);
  };
  const openEdit = (row) => {
    setEditingRow(row);
    form.setFieldsValue({
      name: row.name,
      sort_order: Number(row.sort_order || 0),
      is_active: !!row.is_active,
    });
    setModalOpen(true);
  };

  const buildFD = (v, requiredFile = false) => {
    const fd = new FormData();
    fd.append('name', v.name);
    if (v.sort_order !== undefined && v.sort_order !== null) fd.append('sort_order', String(v.sort_order));
    fd.append('is_active', v.is_active ? 'true' : 'false');
    if (Array.isArray(v.product_type_ids)) {
      v.product_type_ids.forEach((id) => fd.append('product_type_ids[]', String(id)));
    }
    const f = v.font_file?.[0]?.originFileObj;
    if (f) fd.append('font_file', f);
    else if (requiredFile) throw new Error('Font file is required');
    return fd;
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingRow) await updateItem({ id: editingRow.id, body: buildFD(values, false) }).unwrap();
      else await createItem(buildFD(values, true)).unwrap();
      message.success(editingRow ? 'Font updated' : 'Font created');
      setModalOpen(false);
      form.resetFields();
    } catch (err) {
      message.error(err?.data?.message || err?.message || 'Operation failed');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 70 },
    { title: 'Name', dataIndex: 'name' },
    { title: 'Sort', dataIndex: 'sort_order', width: 80 },
    { title: 'Status', dataIndex: 'is_active', width: 100, render: (v) => (v ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>) },
    {
      title: 'Actions', width: 110, render: (_, row) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(row)} />
          <Popconfirm title="Delete font?" onConfirm={() => deleteItem(row.id).unwrap().then(() => message.success('Deleted')).catch(() => message.error('Delete failed'))}>
            <Button type="link" danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>Fonts</h2>
        <Space wrap>
          <Input allowClear prefix={<SearchOutlined />} placeholder="Search font" style={{ width: 220 }} value={searchText} onChange={(e) => setSearchText(e.target.value)} />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add Font</Button>
        </Space>
      </div>
      <Table rowKey="id" loading={isLoading} dataSource={filtered} columns={columns} />

      <Modal title={editingRow ? 'Edit Font' : 'Create Font'} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={handleSubmit} confirmLoading={creating || updating}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="product_type_ids" label="Assign Product Types">
            <Select mode="multiple" options={(Array.isArray(productTypes) ? productTypes : []).map((p) => ({ label: p.name, value: p.id }))} />
          </Form.Item>
          <Form.Item name="sort_order" label="Sort Order"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="is_active" label="Active" valuePropName="checked"><Switch /></Form.Item>
          <Form.Item name="font_file" label={editingRow ? 'Font File (optional)' : 'Font File'} rules={editingRow ? [] : [{ required: true, message: 'Font file required' }]} valuePropName="fileList" getValueFromEvent={(e) => e?.fileList}>
            <Upload beforeUpload={() => false} maxCount={1} accept=".ttf,.woff,.woff2"><Button icon={<UploadOutlined />}>Choose Font File</Button></Upload>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

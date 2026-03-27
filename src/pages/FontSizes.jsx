import { useMemo, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Switch, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useGetFontSizesQuery, useCreateFontSizeMutation, useUpdateFontSizeMutation, useDeleteFontSizeMutation } from '../api/adminApi';

export default function FontSizes() {
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { data: resp, isLoading } = useGetFontSizesQuery();
  const [createItem, { isLoading: creating }] = useCreateFontSizeMutation();
  const [updateItem, { isLoading: updating }] = useUpdateFontSizeMutation();
  const [deleteItem] = useDeleteFontSizeMutation();
  const list = resp?.data ?? resp ?? [];

  const filtered = useMemo(() => {
    const t = searchText.trim().toLowerCase();
    return (Array.isArray(list) ? list : []).filter((r) => !t || String(r.label || '').toLowerCase().includes(t) || String(r.size_value || '').includes(t));
  }, [list, searchText]);

  const openCreate = () => { setEditing(null); form.resetFields(); form.setFieldsValue({ is_active: true }); setModalOpen(true); };
  const openEdit = (row) => { setEditing(row); form.setFieldsValue({ size_value: row.size_value, label: row.label, is_active: !!row.is_active }); setModalOpen(true); };
  const submit = async () => {
    try {
      const v = await form.validateFields();
      if (editing) await updateItem({ id: editing.id, ...v }).unwrap();
      else await createItem(v).unwrap();
      message.success(editing ? 'Font size updated' : 'Font size created');
      setModalOpen(false);
    } catch (e) { message.error(e?.data?.message || e?.message || 'Operation failed'); }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>Font Sizes</h2>
        <Space>
          <Input allowClear prefix={<SearchOutlined />} placeholder="Search size / label" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add Font Size</Button>
        </Space>
      </div>
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={filtered}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 70 },
          { title: 'Size', dataIndex: 'size_value', width: 100 },
          { title: 'Label', dataIndex: 'label' },
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
      <Modal title={editing ? 'Edit Font Size' : 'Create Font Size'} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={submit} confirmLoading={creating || updating}>
        <Form form={form} layout="vertical">
          <Form.Item name="size_value" label="Size" rules={[{ required: true }]}><InputNumber min={1} max={500} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="label" label="Label"><Input /></Form.Item>
          <Form.Item name="is_active" label="Active" valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}

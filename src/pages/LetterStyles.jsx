import { useMemo, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Switch, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import {
  useGetLetterStylesQuery, useCreateLetterStyleMutation, useUpdateLetterStyleMutation,
  useDeleteLetterStyleMutation,
} from '../api/adminApi';

export default function LetterStyles() {
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { data: resp, isLoading } = useGetLetterStylesQuery();
  const [createItem, { isLoading: creating }] = useCreateLetterStyleMutation();
  const [updateItem, { isLoading: updating }] = useUpdateLetterStyleMutation();
  const [deleteItem] = useDeleteLetterStyleMutation();
  const list = resp?.data ?? resp ?? [];

  const filtered = useMemo(() => {
    const t = searchText.trim().toLowerCase();
    return (Array.isArray(list) ? list : []).filter((r) => !t || String(r.name || '').toLowerCase().includes(t));
  }, [list, searchText]);

  const openCreate = () => { setEditing(null); form.resetFields(); form.setFieldsValue({ is_active: true }); setModalOpen(true); };
  const openEdit = (row) => { setEditing(row); form.setFieldsValue({ name: row.name, is_active: !!row.is_active }); setModalOpen(true); };
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
          <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="is_active" label="Active" valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}

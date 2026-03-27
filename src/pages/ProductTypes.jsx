import { useMemo, useState } from 'react';
import { Table, Tag, Input, Modal, Form, Switch, Button, message } from 'antd';
import { SearchOutlined, EditOutlined } from '@ant-design/icons';
import { useGetProductTypesQuery, useUpdateProductTypeMutation } from '../api/adminApi';

export default function ProductTypes() {
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { data = [], isLoading } = useGetProductTypesQuery();
  const [updateProductType, { isLoading: updating }] = useUpdateProductTypeMutation();
  const list = Array.isArray(data) ? data : data?.data ?? [];
  const filtered = useMemo(() => {
    const t = searchText.trim().toLowerCase();
    return list.filter((r) => !t || String(r.name || '').toLowerCase().includes(t) || String(r.slug || '').toLowerCase().includes(t));
  }, [list, searchText]);

  const openEdit = (row) => {
    setEditing(row);
    form.setFieldsValue({ description: row.description, is_active: !!row.is_active });
    setModalOpen(true);
  };
  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      await updateProductType({ id: editing.id, ...values }).unwrap();
      message.success('Product type updated');
      setModalOpen(false);
    } catch (err) {
      message.error(err?.data?.message || 'Update failed');
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Product Types</h2>
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Search product type"
          style={{ width: 260 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>
      <Table dataSource={filtered} columns={[
        { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Slug', dataIndex: 'slug', key: 'slug' },
        { title: 'Active', dataIndex: 'is_active', key: 'is_active', render: (v) => (v ? <Tag color="green">Yes</Tag> : <Tag>No</Tag>) },
        { title: 'Actions', key: 'actions', width: 90, render: (_, row) => <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(row)}>Edit</Button> },
      ]} rowKey="id" loading={isLoading} />
      <Modal title="Edit Product Type" open={modalOpen} onCancel={() => setModalOpen(false)} onOk={handleUpdate} confirmLoading={updating}>
        <Form form={form} layout="vertical">
          <Form.Item name="description" label="Description"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="is_active" label="Active" valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}

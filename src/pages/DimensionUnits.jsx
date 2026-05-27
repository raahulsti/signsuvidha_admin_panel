import { useMemo, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, /* Popconfirm, */ message, Alert } from 'antd';
import { PlusOutlined, EditOutlined, /* DeleteOutlined, */ SearchOutlined } from '@ant-design/icons';
import { useGetDimensionUnitsQuery, useCreateDimensionUnitMutation, useUpdateDimensionUnitMutation /* , useDeleteDimensionUnitMutation */ } from '../api/adminApi';

export default function DimensionUnits() {
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { data: resp, isLoading } = useGetDimensionUnitsQuery();
  const [createItem, { isLoading: creating }] = useCreateDimensionUnitMutation();
  const [updateItem, { isLoading: updating }] = useUpdateDimensionUnitMutation();
  // Delete disabled — use is_active instead to preserve cart/order references
  // const [deleteItem] = useDeleteDimensionUnitMutation();
  const list = resp?.data ?? resp ?? [];

  const filtered = useMemo(() => {
    const t = searchText.trim().toLowerCase();
    return (Array.isArray(list) ? list : []).filter((r) => !t || String(r.unit_name || '').toLowerCase().includes(t));
  }, [list, searchText]);

  const openCreate = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (row) => { setEditing(row); form.setFieldsValue(row); setModalOpen(true); };
  const submit = async () => {
    try {
      const v = await form.validateFields();
      if (editing) await updateItem({ id: editing.id, ...v }).unwrap();
      else await createItem(v).unwrap();
      message.success(editing ? 'Dimension unit updated' : 'Dimension unit created');
      setModalOpen(false);
    } catch (e) { message.error(e?.data?.message || e?.message || 'Operation failed'); }
  };

  return (
    <>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Pricing uses square feet. Enter conversion as feet per 1 unit of width/height (linear). Example: foot = 1, inch ≈ 0.0833333, cm ≈ 0.0328084. Area = width × height × (conversion)²."
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>Dimension Units</h2>
        <Space>
          <Input allowClear prefix={<SearchOutlined />} placeholder="Search unit" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add Unit</Button>
        </Space>
      </div>
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={filtered}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 70 },
          { title: 'Unit Name', dataIndex: 'unit_name' },
          { title: 'Feet per unit (linear)', dataIndex: 'conversion_to_sqft', width: 160 },
          {
            title: 'Actions', width: 110, render: (_, row) => (
              <Space>
                <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(row)} />
                {/* Delete disabled — use is_active instead to preserve cart/order references
                <Popconfirm title="Delete?" onConfirm={() => deleteItem(row.id).unwrap().then(() => message.success('Deleted')).catch(() => message.error('Delete failed'))}>
                  <Button type="link" danger size="small" icon={<DeleteOutlined />} />
                </Popconfirm>
                */}
              </Space>
            ),
          },
        ]}
      />
      <Modal title={editing ? 'Edit Unit' : 'Create Unit'} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={submit} confirmLoading={creating || updating}>
        <Form form={form} layout="vertical">
          <Form.Item name="unit_name" label="Unit Name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="conversion_to_sqft" label="Feet per 1 unit (width/height)" rules={[{ required: true }]}><InputNumber min={0.0001} step={0.0001} style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}

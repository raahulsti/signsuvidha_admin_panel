import { useMemo, useState } from 'react';
import {
  Table, Button, Space, Modal, Form, Input, InputNumber, message, Popconfirm, Select,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useGetProductTypesQuery } from '../../api/adminApi';

export default function ColorModulePage({
  title,
  useListQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  const { data = [], isLoading } = useListQuery();
  const { data: ptResp = [] } = useGetProductTypesQuery();
  const [createItem, { isLoading: creating }] = useCreateMutation();
  const [updateItem, { isLoading: updating }] = useUpdateMutation();
  const [removeItem] = useDeleteMutation();

  const productTypes = Array.isArray(ptResp) ? ptResp : ptResp?.data ?? [];
  const list = Array.isArray(data) ? data : data?.data ?? [];
  const filtered = useMemo(() => {
    const t = searchText.trim().toLowerCase();
    return list.filter((r) => !t || String(r.name || '').toLowerCase().includes(t) || String(r.hex_code || '').toLowerCase().includes(t));
  }, [list, searchText]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ admin_price_extra: 0, product_type_ids: [] });
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    const mappedIds = Array.isArray(row.product_type_ids)
      ? row.product_type_ids
      : String(row.product_type_ids_csv || '')
          .split(',')
          .map((x) => x.trim())
          .filter(Boolean)
          .map((x) => Number(x));
    form.setFieldsValue({
      name: row.name,
      hex_code: row.hex_code,
      admin_price_extra: Number(row.admin_price_extra || 0),
      product_type_ids: mappedIds,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await updateItem({ id: editing.id, ...values }).unwrap();
        message.success(`${title} updated`);
      } else {
        await createItem(values).unwrap();
        message.success(`${title} created`);
      }
      setModalOpen(false);
    } catch (err) {
      message.error(err?.data?.message || 'Failed');
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>{title}</h2>
        <Space>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder={`Search ${title.toLowerCase()}`}
            style={{ width: 240 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Add
          </Button>
        </Space>
      </div>

      <Table
        dataSource={filtered}
        rowKey="id"
        loading={isLoading}
        columns={[
          {
            title: 'Color',
            dataIndex: 'hex_code',
            key: 'hex',
            width: 80,
            render: (hex) => <div style={{ width: 28, height: 28, borderRadius: 4, background: hex || '#ccc' }} />,
          },
          { title: 'Name', dataIndex: 'name', key: 'name' },
          { title: 'Hex', dataIndex: 'hex_code', key: 'hex_code', width: 110 },
          {
            title: 'Price Extra (₹)',
            dataIndex: 'admin_price_extra',
            key: 'admin_price_extra',
            width: 140,
            render: (v) => Number(v || 0).toFixed(2),
          },
          {
            title: 'Actions',
            key: 'actions',
            width: 120,
            render: (_, row) => (
              <Space>
                <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(row)} />
                <Popconfirm
                  title="Delete?"
                  onConfirm={() => removeItem(row.id).unwrap().then(() => message.success('Deleted')).catch(() => message.error('Failed'))}
                >
                  <Button type="link" danger size="small" icon={<DeleteOutlined />} />
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        title={editing ? `Edit ${title}` : `Add ${title}`}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={creating || updating}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name">
            <Input />
          </Form.Item>
          <Form.Item
            name="hex_code"
            label="Hex"
            rules={[
              { required: true, message: 'Hex is required' },
              { pattern: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, message: 'Use #RRGGBB' },
            ]}
          >
            <Input placeholder="#FF0000" />
          </Form.Item>
          <Form.Item name="admin_price_extra" label="Price Extra (₹)" initialValue={0}>
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="product_type_ids" label="Product Mapping">
            <Select
              mode="multiple"
              placeholder="Select product types"
              options={productTypes.map((pt) => ({ label: pt.name, value: pt.id }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

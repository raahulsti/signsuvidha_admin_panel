import { useMemo, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Popconfirm,
  message,
  Tag,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import {
  useGetMaterialStylesQuery,
  useGetProductTypesQuery,
  useCreateMaterialStyleMutation,
  useUpdateMaterialStyleMutation,
  useDeleteMaterialStyleMutation,
} from '../api/adminApi';

export default function MaterialStyles() {
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [productTypeFilter, setProductTypeFilter] = useState();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  const { data: listResp, isLoading } = useGetMaterialStylesQuery({ page: 1, limit: 200 });
  const { data: productTypesResp } = useGetProductTypesQuery();
  const [createRow, { isLoading: creating }] = useCreateMaterialStyleMutation();
  const [updateRow, { isLoading: updating }] = useUpdateMaterialStyleMutation();
  const [deleteRow] = useDeleteMaterialStyleMutation();

  const rows = listResp?.data ?? listResp ?? [];
  const productTypes = productTypesResp?.data ?? productTypesResp ?? [];

  const filteredData = useMemo(() => {
    const term = searchText.trim().toLowerCase();
    return (Array.isArray(rows) ? rows : []).filter((row) => {
      const matchesSearch =
        !term ||
        String(row.name || '').toLowerCase().includes(term) ||
        String(row.product_type_name || '').toLowerCase().includes(term) ||
        String(row.description || '').toLowerCase().includes(term);
      const matchesType =
        !productTypeFilter || String(row.product_type_id) === String(productTypeFilter);
      return matchesSearch && matchesType;
    });
  }, [rows, productTypeFilter, searchText]);

  const openCreateModal = () => {
    setEditingRow(null);
    form.resetFields();
    form.setFieldsValue({ is_active: true, sort_order: 0 });
    setModalOpen(true);
  };

  const openEditModal = (row) => {
    setEditingRow(row);
    form.setFieldsValue({
      product_type_id: row.product_type_id,
      name: row.name,
      description: row.description,
      admin_price_per_sqft: Number(row.admin_price_per_sqft || 0),
      sort_order: Number(row.sort_order || 0),
      is_active: !!row.is_active,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const body = {
        product_type_id: values.product_type_id,
        name: values.name,
        description: values.description || '',
        admin_price_per_sqft: Number(values.admin_price_per_sqft),
        sort_order: values.sort_order ?? 0,
        is_active: !!values.is_active,
      };
      if (editingRow) {
        await updateRow({ id: editingRow.id, body }).unwrap();
        message.success('Material style updated');
      } else {
        await createRow(body).unwrap();
        message.success('Material style created');
      }
      setModalOpen(false);
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err?.data?.message || err?.message || 'Save failed');
    }
  };

  return (
    <>
      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Search name / type / description"
          style={{ width: 280 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Select
          allowClear
          placeholder="Product type"
          style={{ width: 200 }}
          value={productTypeFilter}
          onChange={setProductTypeFilter}
          options={productTypes.map((p) => ({ value: p.id, label: p.name }))}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
          Add material style
        </Button>
      </Space>

      <Table
        loading={isLoading}
        size="small"
        rowKey="id"
        dataSource={filteredData}
        columns={[
          { title: 'Name', dataIndex: 'name', key: 'name' },
          { title: 'Product Type', dataIndex: 'product_type_name', key: 'pt' },
          { title: 'Admin ₹/sq ft', dataIndex: 'admin_price_per_sqft', key: 'p', render: (v) => `₹${Number(v || 0).toFixed(2)}` },
          { title: 'Active', dataIndex: 'is_active', key: 'a', render: (v) => (v ? <Tag color="green">Yes</Tag> : <Tag>No</Tag>) },
          {
            title: 'Actions',
            key: 'act',
            width: 140,
            render: (_, row) => (
              <Space>
                <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditModal(row)} />
                <Popconfirm title="Delete this material style?" onConfirm={() => deleteRow(row.id).unwrap().then(() => message.success('Deleted'))}>
                  <Button type="link" danger size="small" icon={<DeleteOutlined />} />
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        title={editingRow ? 'Edit material style' : 'Add material style'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={creating || updating}
        destroyOnClose
        width={520}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="product_type_id" label="Product type" rules={[{ required: true }]}>
            <Select options={productTypes.map((p) => ({ value: p.id, label: p.name }))} />
          </Form.Item>
          <Form.Item name="name" label="Name" rules={[{ required: true, min: 2 }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="admin_price_per_sqft" label="Admin price (₹/sq ft)" rules={[{ required: true }]}>
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="sort_order" label="Sort order">
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

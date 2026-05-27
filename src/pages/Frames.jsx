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
  // Popconfirm,
  message,
  Tag,
  Upload,
  Image,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  // DeleteOutlined,
  SearchOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import {
  useGetFramesQuery,
  useGetProductTypesQuery,
  useCreateFrameMutation,
  useUpdateFrameMutation,
  // useDeleteFrameMutation, // Delete disabled — use is_active instead to preserve cart/order references
} from '../api/adminApi';

export default function Frames() {
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [productTypeFilter, setProductTypeFilter] = useState();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  const { data: framesResp, isLoading } = useGetFramesQuery({ page: 1, limit: 200 });
  const { data: productTypesResp } = useGetProductTypesQuery();
  const [createFrame, { isLoading: creating }] = useCreateFrameMutation();
  const [updateFrame, { isLoading: updating }] = useUpdateFrameMutation();
  // Delete disabled — use is_active instead to preserve cart/order references
  // const [deleteFrame] = useDeleteFrameMutation();

  const frames = framesResp?.data ?? framesResp ?? [];
  const productTypes = productTypesResp?.data ?? productTypesResp ?? [];

  const filteredData = useMemo(() => {
    const term = searchText.trim().toLowerCase();
    return (Array.isArray(frames) ? frames : []).filter((row) => {
      const matchesSearch =
        !term ||
        String(row.name || '').toLowerCase().includes(term) ||
        String(row.product_type_name || '').toLowerCase().includes(term) ||
        String(row.description || '').toLowerCase().includes(term);
      const matchesType =
        !productTypeFilter || String(row.product_type_id) === String(productTypeFilter);
      return matchesSearch && matchesType;
    });
  }, [frames, productTypeFilter, searchText]);

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

  const buildFormData = (values, includeImageRequired = false) => {
    const fd = new FormData();
    fd.append('product_type_id', String(values.product_type_id));
    fd.append('name', values.name);
    fd.append('description', values.description || '');
    fd.append('admin_price_per_sqft', String(values.admin_price_per_sqft));
    if (values.sort_order !== undefined && values.sort_order !== null) {
      fd.append('sort_order', String(values.sort_order));
    }
    fd.append('is_active', values.is_active ? 'true' : 'false');
    const imageFile = values.image?.[0]?.originFileObj;
    if (imageFile) {
      fd.append('image', imageFile);
    } else if (includeImageRequired) {
      throw new Error('Image is required');
    }
    return fd;
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingRow) {
        const fd = buildFormData(values, false);
        await updateFrame({ id: editingRow.id, body: fd }).unwrap();
        message.success('Frame updated');
      } else {
        const fd = buildFormData(values, true);
        await createFrame(fd).unwrap();
        message.success('Frame created');
      }
      setModalOpen(false);
      form.resetFields();
    } catch (err) {
      message.error(err?.data?.message || err?.message || 'Operation failed');
    }
  };

  // Delete disabled — use is_active instead to preserve cart/order references
  // const handleDelete = async (id) => {
  //   try {
  //     await deleteFrame(id).unwrap();
  //     message.success('Frame deleted');
  //   } catch (err) {
  //     message.error(err?.data?.message || 'Delete failed');
  //   }
  // };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
    {
      title: 'Preview',
      dataIndex: 'file_url',
      key: 'file_url',
      width: 90,
      render: (url) => (url ? <Image src={url} width={46} height={46} style={{ objectFit: 'cover', borderRadius: 6 }} /> : '-'),
    },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Product Type', dataIndex: 'product_type_name', key: 'product_type_name', width: 170 },
    { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true, render: (v) => v || '-' },
    {
      title: 'Price/sqft (₹)',
      dataIndex: 'admin_price_per_sqft',
      key: 'admin_price_per_sqft',
      width: 140,
      render: (v) => Number(v || 0).toFixed(2),
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (v) => (v ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, row) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditModal(row)} />
          {/* Delete disabled — use is_active instead to preserve cart/order references
          <Popconfirm title="Delete this frame?" onConfirm={() => handleDelete(row.id)}>
            <Button type="link" danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
          */}
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>Frames</h2>
        <Space wrap>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Search frame / product type"
            style={{ width: 260 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            allowClear
            placeholder="Filter by product type"
            style={{ width: 220 }}
            value={productTypeFilter}
            onChange={setProductTypeFilter}
            options={(Array.isArray(productTypes) ? productTypes : []).map((pt) => ({
              label: pt.name,
              value: pt.id,
            }))}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            Add Frame
          </Button>
        </Space>
      </div>

      <Table rowKey="id" loading={isLoading} dataSource={filteredData} columns={columns} />

      <Modal
        title={editingRow ? 'Edit Frame' : 'Create Frame'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={creating || updating}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="product_type_id" label="Product Type" rules={[{ required: true, message: 'Please select product type' }]}>
            <Select
              placeholder="Select product type"
              options={(Array.isArray(productTypes) ? productTypes : []).map((pt) => ({
                label: pt.name,
                value: pt.id,
              }))}
            />
          </Form.Item>
          <Form.Item name="name" label="Frame Name" rules={[{ required: true, message: 'Please enter name' }]}>
            <Input placeholder="e.g. Golden border" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Optional description" />
          </Form.Item>
          <Form.Item name="admin_price_per_sqft" label="Admin Price per sqft (₹)" rules={[{ required: true, message: 'Please enter price' }]}>
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="sort_order" label="Sort Order" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="is_active" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item
            name="image"
            label={editingRow ? 'Image (optional)' : 'Image'}
            rules={editingRow ? [] : [{ required: true, message: 'Please upload image' }]}
            valuePropName="fileList"
            getValueFromEvent={(e) => e?.fileList}
          >
            <Upload beforeUpload={() => false} maxCount={1} accept="image/*">
              <Button icon={<UploadOutlined />}>Choose Image</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

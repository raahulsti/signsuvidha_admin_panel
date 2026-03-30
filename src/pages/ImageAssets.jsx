import { useMemo, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Popconfirm,
  message,
  Tag,
  Upload,
  InputNumber,
  Image,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import {
  useGetImageAssetsQuery,
  useGetProductTypesQuery,
  useCreateImageAssetMutation,
  useUpdateImageAssetMutation,
  useDeleteImageAssetMutation,
} from '../api/adminApi';

const COMMON_IMAGE_TYPES = ['wallpaper', 'base', 'frame', 'pylon'];

export default function ImageAssets() {
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [productTypeFilter, setProductTypeFilter] = useState();
  const [imageTypeFilter, setImageTypeFilter] = useState();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  const { data: imageAssetsResp, isLoading } = useGetImageAssetsQuery({ page: 1, limit: 500 });
  const { data: productTypesResp } = useGetProductTypesQuery();
  const [createImageAsset, { isLoading: creating }] = useCreateImageAssetMutation();
  const [updateImageAsset, { isLoading: updating }] = useUpdateImageAssetMutation();
  const [deleteImageAsset] = useDeleteImageAssetMutation();

  const imageAssets = imageAssetsResp?.data ?? imageAssetsResp ?? [];
  const productTypes = productTypesResp?.data ?? productTypesResp ?? [];

  const imageTypeOptions = useMemo(() => {
    const fromData = (Array.isArray(imageAssets) ? imageAssets : []).map((x) => x.image_type).filter(Boolean);
    const all = Array.from(new Set([...COMMON_IMAGE_TYPES, ...fromData]));
    return all.map((v) => ({ label: v, value: v }));
  }, [imageAssets]);

  const filteredData = useMemo(() => {
    const term = searchText.trim().toLowerCase();
    return (Array.isArray(imageAssets) ? imageAssets : []).filter((row) => {
      const matchesSearch =
        !term ||
        String(row.title || '').toLowerCase().includes(term) ||
        String(row.image_type || '').toLowerCase().includes(term) ||
        String(row.product_type_name || '').toLowerCase().includes(term);
      const matchesType =
        !productTypeFilter || String(row.product_type_id) === String(productTypeFilter);
      const matchesImageType = !imageTypeFilter || String(row.image_type) === String(imageTypeFilter);
      return matchesSearch && matchesType && matchesImageType;
    });
  }, [imageAssets, imageTypeFilter, productTypeFilter, searchText]);

  const openCreateModal = () => {
    setEditingRow(null);
    form.resetFields();
    form.setFieldsValue({
      is_active: true,
      sort_order: 0,
      image_type: 'wallpaper',
    });
    setModalOpen(true);
  };

  const openEditModal = (row) => {
    setEditingRow(row);
    form.setFieldsValue({
      product_type_id: row.product_type_id,
      image_type: row.image_type,
      title: row.title,
      sort_order: Number(row.sort_order || 0),
      is_active: !!row.is_active,
    });
    setModalOpen(true);
  };

  const buildFormData = (values, includeImageRequired = false) => {
    const fd = new FormData();
    fd.append('product_type_id', String(values.product_type_id));
    fd.append('image_type', values.image_type);
    fd.append('title', values.title || '');
    fd.append('sort_order', String(values.sort_order || 0));
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
        await updateImageAsset({ id: editingRow.id, body: fd }).unwrap();
        message.success('Image asset updated');
      } else {
        const fd = buildFormData(values, true);
        await createImageAsset(fd).unwrap();
        message.success('Image asset created');
      }
      setModalOpen(false);
      form.resetFields();
    } catch (err) {
      message.error(err?.data?.message || err?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteImageAsset(id).unwrap();
      message.success('Image asset deleted');
    } catch (err) {
      message.error(err?.data?.message || 'Delete failed');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
    {
      title: 'Preview',
      dataIndex: 'image_url',
      key: 'image_url',
      width: 90,
      render: (url) => (url ? <Image src={url} width={46} height={46} style={{ objectFit: 'cover', borderRadius: 6 }} /> : '-'),
    },
    { title: 'Title', dataIndex: 'title', key: 'title', render: (v) => v || '-' },
    {
      title: 'Image Type',
      dataIndex: 'image_type',
      key: 'image_type',
      width: 120,
      render: (v) => <Tag>{v}</Tag>,
    },
    {
      title: 'Product Type',
      dataIndex: 'product_type_name',
      key: 'product_type_name',
      width: 170,
    },
    { title: 'Sort', dataIndex: 'sort_order', key: 'sort_order', width: 80 },
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
          <Popconfirm title="Delete this image asset?" onConfirm={() => handleDelete(row.id)}>
            <Button type="link" danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <h2 style={{ margin: 0 }}>Image Assets</h2>
        <Space wrap>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Search title / image type / product type"
            style={{ width: 280 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            allowClear
            placeholder="Filter by product type"
            style={{ width: 200 }}
            value={productTypeFilter}
            onChange={setProductTypeFilter}
            options={(Array.isArray(productTypes) ? productTypes : []).map((pt) => ({
              label: pt.name,
              value: pt.id,
            }))}
          />
          <Select
            allowClear
            showSearch
            placeholder="Filter by image type"
            style={{ width: 180 }}
            value={imageTypeFilter}
            onChange={setImageTypeFilter}
            options={imageTypeOptions}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            Add Image
          </Button>
        </Space>
      </div>

      <Table rowKey="id" loading={isLoading} dataSource={filteredData} columns={columns} />

      <Modal
        title={editingRow ? 'Edit Image Asset' : 'Create Image Asset'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={creating || updating}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="product_type_id"
            label="Product Type"
            rules={[{ required: true, message: 'Please select product type' }]}
          >
            <Select
              placeholder="Select product type"
              options={(Array.isArray(productTypes) ? productTypes : []).map((pt) => ({
                label: pt.name,
                value: pt.id,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="image_type"
            label="Image Type"
            rules={[{ required: true, message: 'Please enter image type' }]}
          >
            <Input placeholder="e.g. wallpaper, base, frame, pylon" />
          </Form.Item>

          <Form.Item name="title" label="Title">
            <Input placeholder="Optional title" />
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

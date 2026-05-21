import { useMemo, useState } from 'react';
import {
  Table, Button, Space, Modal, Form, Input, InputNumber, Switch, Popconfirm,
  message, Tag, Upload, Image, Select, Drawer, Divider,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons';
import {
  useGetPylonsQuery,
  useGetProductTypesQuery,
  useCreatePylonMutation,
  useUpdatePylonMutation,
  useDeletePylonMutation,
  useCreatePylonCategoryMutation,
  useUpdatePylonCategoryMutation,
  useDeletePylonCategoryMutation,
} from '../api/adminApi';

export default function Pylons() {
  const [form] = Form.useForm();
  const [catForm] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [catDrawerOpen, setCatDrawerOpen] = useState(false);
  const [activePylon, setActivePylon] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  const { data: resp, isLoading } = useGetPylonsQuery({ page: 1, limit: 200 });
  const { data: ptResp } = useGetProductTypesQuery();
  const [createPylon, { isLoading: creating }] = useCreatePylonMutation();
  const [updatePylon, { isLoading: updating }] = useUpdatePylonMutation();
  const [deletePylon] = useDeletePylonMutation();
  const [createCategory, { isLoading: creatingCat }] = useCreatePylonCategoryMutation();
  const [updateCategory, { isLoading: updatingCat }] = useUpdatePylonCategoryMutation();
  const [deleteCategory] = useDeletePylonCategoryMutation();

  const rows = resp?.data ?? resp ?? [];
  const productTypes = ptResp?.data ?? ptResp ?? [];
  const pylonProductTypes = productTypes.filter((pt) => pt.slug === 'pylon_sign');

  const filteredData = useMemo(() => {
    const term = searchText.trim().toLowerCase();
    return (Array.isArray(rows) ? rows : []).filter((row) => {
      if (!term) return true;
      return [row.name, row.description].some((v) => String(v || '').toLowerCase().includes(term));
    });
  }, [rows, searchText]);

  const openCreate = () => {
    setEditingRow(null);
    form.resetFields();
    form.setFieldsValue({
      product_type_id: pylonProductTypes[0]?.id,
      is_active: true,
      sort_order: 0,
    });
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingRow(row);
    form.setFieldsValue({
      product_type_id: row.product_type_id,
      name: row.name,
      description: row.description,
      sort_order: Number(row.sort_order || 0),
      is_active: !!row.is_active,
    });
    setModalOpen(true);
  };

  const buildFormData = (values, requireImage) => {
    const fd = new FormData();
    fd.append('product_type_id', String(values.product_type_id));
    fd.append('name', values.name);
    fd.append('description', values.description || '');
    if (values.sort_order !== undefined && values.sort_order !== null) {
      fd.append('sort_order', String(values.sort_order));
    }
    fd.append('is_active', values.is_active ? 'true' : 'false');
    const imageFile = values.image?.[0]?.originFileObj;
    if (imageFile) fd.append('image', imageFile);
    else if (requireImage) throw new Error('Image is required');
    return fd;
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const fd = buildFormData(values, !editingRow);
      if (editingRow) {
        await updatePylon({ id: editingRow.id, body: fd }).unwrap();
        message.success('Pylon updated');
      } else {
        await createPylon(fd).unwrap();
        message.success('Pylon created');
      }
      setModalOpen(false);
    } catch (err) {
      message.error(err?.data?.message || err.message || 'Save failed');
    }
  };

  const openCategories = (row) => {
    setActivePylon(row);
    setEditingCategory(null);
    catForm.resetFields();
    catForm.setFieldsValue({ is_active: true, sort_order: 0, admin_category_price: 0, admin_tiles_price: 0 });
    setCatDrawerOpen(true);
  };

  const openEditCategory = (cat) => {
    setEditingCategory(cat);
    catForm.setFieldsValue({
      name: cat.name,
      admin_category_price: Number(cat.category_price ?? cat.admin_category_price ?? 0),
      tiles_name: cat.tiles_name,
      admin_tiles_price: Number(cat.tiles_price ?? cat.admin_tiles_price ?? 0),
      sort_order: Number(cat.sort_order || 0),
      is_active: cat.is_active !== false,
    });
  };

  const handleSaveCategory = async () => {
    try {
      const values = await catForm.validateFields();
      const body = {
        name: values.name,
        admin_category_price: values.admin_category_price,
        tiles_name: values.tiles_name,
        admin_tiles_price: values.admin_tiles_price,
        sort_order: values.sort_order,
        is_active: values.is_active,
      };
      if (editingCategory) {
        await updateCategory({
          pylonId: activePylon.id,
          categoryId: editingCategory.id,
          body,
        }).unwrap();
        message.success('Category updated');
      } else {
        await createCategory({ pylonId: activePylon.id, body }).unwrap();
        message.success('Category created');
      }
      setEditingCategory(null);
      catForm.resetFields();
      catForm.setFieldsValue({ is_active: true, sort_order: 0, admin_category_price: 0, admin_tiles_price: 0 });
    } catch (err) {
      message.error(err?.data?.message || err.message || 'Save failed');
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    {
      title: 'Image',
      key: 'image',
      render: (_, row) => row.thumbnail_url || row.file_url
        ? <Image src={row.thumbnail_url || row.file_url} width={48} height={48} style={{ objectFit: 'cover' }} />
        : '—',
    },
    {
      title: 'Categories',
      key: 'categories',
      render: (_, row) => <Tag>{row.categories?.length || 0}</Tag>,
    },
    {
      title: 'Active',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (v) => (v ? <Tag color="green">Yes</Tag> : <Tag>No</Tag>),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <Space>
          <Button size="small" onClick={() => openCategories(row)}>Categories</Button>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(row)} />
          <Popconfirm title="Delete this pylon?" onConfirm={async () => {
            try {
              await deletePylon(row.id).unwrap();
              message.success('Deleted');
            } catch (err) {
              message.error(err?.data?.message || 'Delete failed');
            }
          }}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const catColumns = [
    { title: 'Category', dataIndex: 'name', key: 'name' },
    {
      title: 'Category price',
      key: 'cp',
      render: (_, r) => `₹${Number(r.category_price ?? r.admin_category_price ?? 0).toFixed(2)}`,
    },
    { title: 'Tiles name', dataIndex: 'tiles_name', key: 'tiles_name' },
    {
      title: 'Tile price',
      key: 'tp',
      render: (_, r) => `₹${Number(r.tiles_price ?? r.admin_tiles_price ?? 0).toFixed(2)}`,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, cat) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEditCategory(cat)} />
          <Popconfirm title="Delete category?" onConfirm={async () => {
            try {
              await deleteCategory({ pylonId: activePylon.id, categoryId: cat.id }).unwrap();
              message.success('Deleted');
            } catch (err) {
              message.error(err?.data?.message || 'Delete failed');
            }
          }}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }} wrap>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search pylons"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 280 }}
          allowClear
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add Pylon</Button>
      </Space>

      <Table rowKey="id" loading={isLoading} columns={columns} dataSource={filteredData} pagination={{ pageSize: 20 }} />

      <Modal
        title={editingRow ? 'Edit Pylon' : 'Add Pylon'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={creating || updating}
        width={560}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="product_type_id" label="Product type" rules={[{ required: true }]}>
            <Select
              options={pylonProductTypes.map((pt) => ({ value: pt.id, label: pt.name }))}
              placeholder="Select pylon product type"
            />
          </Form.Item>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            name="image"
            label="Image"
            valuePropName="fileList"
            getValueFromEvent={(e) => e?.fileList}
            rules={editingRow ? [] : [{ required: true, message: 'Upload an image' }]}
          >
            <Upload beforeUpload={() => false} maxCount={1} listType="picture">
              <Button icon={<UploadOutlined />}>Upload</Button>
            </Upload>
          </Form.Item>
          <Form.Item name="sort_order" label="Sort order">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="is_active" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title={activePylon ? `Categories — ${activePylon.name}` : 'Categories'}
        open={catDrawerOpen}
        onClose={() => setCatDrawerOpen(false)}
        width={720}
      >
        <Form form={catForm} layout="vertical">
          <Form.Item name="name" label="Category name (e.g. 4M)" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="admin_category_price" label="Category price (₹)" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="tiles_name" label="Tiles name (e.g. 2×2)" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="admin_tiles_price" label="Tile unit price (₹)" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="sort_order" label="Sort order">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="is_active" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Button type="primary" onClick={handleSaveCategory} loading={creatingCat || updatingCat}>
            {editingCategory ? 'Update category' : 'Add category'}
          </Button>
        </Form>
        <Divider />
        <Table
          rowKey="id"
          size="small"
          columns={catColumns}
          dataSource={activePylon?.categories || []}
          pagination={false}
        />
      </Drawer>
    </div>
  );
}

import { useMemo, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Popconfirm,
  message,
  Tag,
  Upload,
  Image,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons';
import {
  useGetLollipopElementsQuery,
  useCreateLollipopElementMutation,
  useUpdateLollipopElementMutation,
  useDeleteLollipopElementMutation,
} from '../api/adminApi';

const LOLLIPOP_PRODUCT_TYPE_ID = 6;

export default function LollipopElements() {
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  const { data: resp, isLoading } = useGetLollipopElementsQuery({ page: 1, limit: 200 });
  const [createRow, { isLoading: creating }] = useCreateLollipopElementMutation();
  const [updateRow, { isLoading: updating }] = useUpdateLollipopElementMutation();
  const [deleteRow] = useDeleteLollipopElementMutation();

  const rows = resp?.data ?? resp ?? [];

  const filteredData = useMemo(() => {
    const term = searchText.trim().toLowerCase();
    return (Array.isArray(rows) ? rows : []).filter((row) => {
      if (!term) return true;
      return [row.name, row.description].some((v) =>
        String(v || '').toLowerCase().includes(term)
      );
    });
  }, [rows, searchText]);

  const openCreate = () => {
    setEditingRow(null);
    form.resetFields();
    form.setFieldsValue({ product_type_id: LOLLIPOP_PRODUCT_TYPE_ID, is_active: true, sort_order: 0 });
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingRow(row);
    form.setFieldsValue({
      name: row.name,
      description: row.description,
      admin_price: Number(row.admin_price ?? row.price ?? 0),
      sort_order: Number(row.sort_order || 0),
      is_active: !!row.is_active,
    });
    setModalOpen(true);
  };

  const buildFormData = (values, requireImage) => {
    const fd = new FormData();
    fd.append('product_type_id', String(LOLLIPOP_PRODUCT_TYPE_ID));
    fd.append('name', values.name);
    fd.append('description', values.description || '');
    fd.append('admin_price', String(values.admin_price));
    if (values.sort_order !== undefined && values.sort_order !== null) {
      fd.append('sort_order', String(values.sort_order));
    }
    fd.append('is_active', values.is_active ? 'true' : 'false');
    const imageFile = values.image?.[0]?.originFileObj;
    if (imageFile) {
      fd.append('image', imageFile);
    } else if (requireImage) {
      throw new Error('Image is required');
    }
    return fd;
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingRow) {
        const fd = buildFormData(values, false);
        await updateRow({ id: editingRow.id, body: fd }).unwrap();
        message.success('Updated');
      } else {
        const fd = buildFormData(values, true);
        await createRow(fd).unwrap();
        message.success('Created');
      }
      setModalOpen(false);
      form.resetFields();
    } catch (err) {
      message.error(err?.data?.message || err?.message || 'Failed');
    }
  };

  const columns = [
    {
      title: 'Image',
      dataIndex: 'image',
      width: 80,
      render: (_, row) => {
        const url = row.image || row.file_url || row.thumbnail_url;
        return url ? (
          <Image src={url} width={48} height={48} style={{ objectFit: 'cover', borderRadius: 6 }} />
        ) : (
          '-'
        );
      },
    },
    { title: 'Name', dataIndex: 'name' },
    { title: 'Description', dataIndex: 'description', ellipsis: true, render: (v) => v || '-' },
    {
      title: 'Price (₹)',
      dataIndex: 'admin_price',
      render: (_, row) => Number(row.admin_price ?? row.price ?? 0).toFixed(2),
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      render: (v) => (v ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>),
    },
    {
      title: 'Actions',
      render: (_, row) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(row)} />
          <Popconfirm title="Delete?" onConfirm={async () => { await deleteRow(row.id).unwrap(); message.success('Deleted'); }}>
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ margin: 0 }}>Lollipop Elements</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add element</Button>
      </div>
      <Input
        allowClear
        prefix={<SearchOutlined />}
        placeholder="Search name / description"
        style={{ width: 280, marginBottom: 12 }}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />
      <Table rowKey="id" loading={isLoading} dataSource={filteredData} columns={columns} pagination={false} />

      <Modal
        title={editingRow ? 'Edit lollipop element' : 'Add lollipop element'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={creating || updating}
        width={520}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Name is required' }]}>
            <Input placeholder="Element name" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Optional description" />
          </Form.Item>
          <Form.Item name="admin_price" label="Price (₹)" rules={[{ required: true, message: 'Price is required' }]}>
            <InputNumber min={0} step={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="sort_order" label="Sort order" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="is_active" label="Active" valuePropName="checked" initialValue>
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
              <Button icon={<UploadOutlined />}>Choose image</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

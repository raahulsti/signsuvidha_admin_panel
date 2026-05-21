import { useMemo, useState } from 'react';
import {
  Table, Button, Space, Modal, Form, Input, InputNumber, Select, Switch, Popconfirm,
  message, Upload, Image, Tag,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons';
import {
  useGetListedProductsQuery, useCreateListedProductMutation, useUpdateListedProductMutation,
  useDeleteListedProductMutation, useGetProductTypesQuery,
} from '../api/adminApi';

const SIZES = [
  { key: 'regular', label: 'Regular' },
  { key: 'medium', label: 'Medium' },
  { key: 'large', label: 'Large' },
];

function buildFormData(values, fileList) {
  const fd = new FormData();
  Object.entries(values).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (typeof v === 'boolean') fd.append(k, v ? '1' : '0');
    else fd.append(k, String(v));
  });
  fileList.forEach((f) => {
    if (f.originFileObj) fd.append('images', f.originFileObj);
  });
  return fd;
}

export default function ListedProducts() {
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [removeImageIds, setRemoveImageIds] = useState([]);

  const { data: resp, isLoading } = useGetListedProductsQuery();
  const { data: ptResp } = useGetProductTypesQuery();
  const [createItem, { isLoading: creating }] = useCreateListedProductMutation();
  const [updateItem, { isLoading: updating }] = useUpdateListedProductMutation();
  const [deleteItem] = useDeleteListedProductMutation();

  const list = resp?.data ?? resp ?? [];
  const productTypes = ptResp?.data ?? ptResp ?? [];

  const filtered = useMemo(() => {
    const t = searchText.trim().toLowerCase();
    return (Array.isArray(list) ? list : []).filter((r) => !t || String(r.name || '').toLowerCase().includes(t));
  }, [list, searchText]);

  const openCreate = () => {
    setEditing(null);
    setFileList([]);
    setRemoveImageIds([]);
    form.resetFields();
    form.setFieldsValue({ is_best_seller: false, sort_order: 0, is_active: true });
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setFileList([]);
    setRemoveImageIds([]);
    const variantMap = {};
    (row.variants || []).forEach((v) => { variantMap[`price_${v.size}`] = Number(v.admin_price || 0); });
    form.setFieldsValue({
      product_type_id: row.product_type_id,
      name: row.name,
      description: row.description,
      is_best_seller: !!row.is_best_seller,
      sort_order: Number(row.sort_order || 0),
      is_active: !!row.is_active,
      ...variantMap,
    });
    setModalOpen(true);
  };

  const toggleRemoveImage = (imageId, images) => {
    setRemoveImageIds((prev) => {
      const next = prev.includes(imageId) ? prev.filter((id) => id !== imageId) : [...prev, imageId];
      return next;
    });
  };

  const submit = async () => {
    try {
      const v = await form.validateFields();
      const hasAnyPrice = SIZES.some((s) => {
        const val = v[`price_${s.key}`];
        return val != null && val !== '' && !Number.isNaN(Number(val));
      });
      if (!hasAnyPrice) {
        message.error('Add at least one size price (regular, medium, or large)');
        return;
      }
      const fd = buildFormData(v, fileList);
      SIZES.forEach((s) => {
        const key = `price_${s.key}`;
        if (v[key] === null || v[key] === '') fd.append(key, '');
      });
      if (removeImageIds.length) fd.append('remove_image_ids', JSON.stringify(removeImageIds));
      if (editing) await updateItem({ id: editing.id, body: fd }).unwrap();
      else await createItem(fd).unwrap();
      message.success(editing ? 'Listed product updated' : 'Listed product created');
      setModalOpen(false);
    } catch (e) {
      message.error(e?.data?.message || e?.message || 'Operation failed');
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>Listed Products</h2>
        <Space>
          <Input allowClear prefix={<SearchOutlined />} placeholder="Search" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add Listed Product</Button>
        </Space>
      </div>
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={filtered}
        scroll={{ x: 1100 }}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 60 },
          {
            title: 'Image',
            width: 80,
            render: (_, row) => row.thumbnail_url
              ? <Image src={row.thumbnail_url} width={48} height={48} style={{ objectFit: 'cover', borderRadius: 4 }} />
              : '—',
          },
          { title: 'Name', dataIndex: 'name' },
          { title: 'Type ID', dataIndex: 'product_type_id', width: 80 },
          {
            title: 'Sizes & prices',
            width: 200,
            render: (_, row) => (row.variants || []).length
              ? (row.variants || []).map((v) => (
                <div key={v.size}><Tag>{v.size}</Tag> ₹{Number(v.admin_price || 0).toFixed(0)}</div>
              ))
              : '—',
          },
          { title: 'From ₹', dataIndex: 'price_from', width: 90, render: (v) => Number(v || 0).toFixed(0) },
          { title: 'Best', dataIndex: 'is_best_seller', width: 70, render: (v) => (v ? 'Yes' : 'No') },
          { title: 'Active', dataIndex: 'is_active', width: 70, render: (v) => (v ? 'Yes' : 'No') },
          {
            title: 'Actions', width: 100, render: (_, row) => (
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
      <Modal
        title={editing ? 'Edit Listed Product' : 'Create Listed Product'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={submit}
        confirmLoading={creating || updating}
        width={640}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="product_type_id" label="Product Type (app section)" rules={[{ required: true }]}>
            <Select options={(Array.isArray(productTypes) ? productTypes : []).map((p) => ({ label: p.name, value: p.id }))} />
          </Form.Item>
          <Form.Item name="name" label="Product name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="Description"><Input.TextArea rows={3} /></Form.Item>
          <p style={{ margin: '0 0 8px', color: '#666', fontSize: 13 }}>
            Size prices — fill only the sizes you sell (e.g. regular only, or regular + large). At least one required.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {SIZES.map((s) => (
              <Form.Item key={s.key} name={`price_${s.key}`} label={`${s.label} price (₹)`}>
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="Optional" />
              </Form.Item>
            ))}
          </div>
          <Form.Item label="Images (multiple)">
            <Upload
              listType="picture-card"
              fileList={fileList}
              beforeUpload={() => false}
              onChange={({ fileList: fl }) => setFileList(fl)}
              multiple
              accept="image/*"
            >
              {fileList.length < 12 && (
                <div><UploadOutlined /><div style={{ marginTop: 8 }}>Upload</div></div>
              )}
            </Upload>
          </Form.Item>
          {(editing?.image_rows?.length > 0) && (
            <Form.Item label="Existing images (click to mark remove)">
              <Space wrap>
                {(editing.image_rows || []).map((imgRow) => {
                  const marked = removeImageIds.includes(imgRow.id);
                  return (
                    <div
                      key={imgRow.id}
                      style={{ border: marked ? '2px solid red' : '1px solid #ddd', padding: 4, cursor: 'pointer' }}
                      onClick={() => toggleRemoveImage(imgRow.id)}
                    >
                      <Image src={imgRow.file_url} width={64} height={64} style={{ objectFit: 'cover' }} />
                      {marked && <div style={{ color: 'red', fontSize: 11 }}>Remove</div>}
                    </div>
                  );
                })}
              </Space>
            </Form.Item>
          )}
          <Form.Item name="is_best_seller" label="Best Seller" valuePropName="checked"><Switch /></Form.Item>
          <Form.Item name="sort_order" label="Sort Order"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="is_active" label="Active" valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}

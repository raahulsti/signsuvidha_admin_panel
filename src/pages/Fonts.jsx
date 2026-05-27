import { useEffect, useMemo, useState } from 'react';
import {
  Table, Button, Space, Modal, Form, Input, InputNumber, Select,
  Switch, /* Popconfirm, */ message, Tag,
} from 'antd';
import {
  PlusOutlined, EditOutlined, /* DeleteOutlined, */ SearchOutlined,
} from '@ant-design/icons';
import {
  useGetFontsQuery, useCreateFontMutation, useUpdateFontMutation,
  // useDeleteFontMutation, // Delete disabled — use is_active instead to preserve cart/order references
  useGetProductTypesQuery,
} from '../api/adminApi';
import { GOOGLE_FONT_FAMILIES } from '../constants/googleFonts';

export default function Fonts() {
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [selectedPreviewFont, setSelectedPreviewFont] = useState('Open Sans');
  const { data: fontsResp, isLoading } = useGetFontsQuery();
  const { data: productTypesResp } = useGetProductTypesQuery();
  const [createItem, { isLoading: creating }] = useCreateFontMutation();
  const [updateItem, { isLoading: updating }] = useUpdateFontMutation();
  // Delete disabled — use is_active instead to preserve cart/order references
  // const [deleteItem] = useDeleteFontMutation();

  const fonts = fontsResp?.data ?? fontsResp ?? [];
  const productTypes = productTypesResp?.data ?? productTypesResp ?? [];
  const filtered = useMemo(() => {
    const term = searchText.trim().toLowerCase();
    return (Array.isArray(fonts) ? fonts : []).filter((r) => !term || String(r.name || '').toLowerCase().includes(term));
  }, [fonts, searchText]);

  useEffect(() => {
    const family = selectedPreviewFont || 'Open Sans';
    const href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, '+')}:wght@300;400;500;600;700&display=swap`;
    const linkId = 'admin-font-preview-link';
    let link = document.getElementById(linkId);
    if (!link) {
      link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = href;
  }, [selectedPreviewFont]);

  const parsePricesCsv = (csv) => {
    if (!csv) return [];
    return String(csv)
      .split(',')
      .map((pair) => {
        const [productTypeId, price] = pair.split(':');
        const pt = Number(productTypeId);
        const p = Number(price);
        if (!Number.isFinite(pt)) return null;
        return { product_type_id: pt, admin_price_extra: Number.isFinite(p) ? p : 0 };
      })
      .filter(Boolean);
  };

  const openCreate = () => {
    setEditingRow(null);
    form.resetFields();
    form.setFieldsValue({
      name: 'Open Sans',
      is_active: true,
      sort_order: 0,
      product_type_prices: [{ product_type_id: undefined, admin_price_extra: 0 }],
    });
    setSelectedPreviewFont('Open Sans');
    setModalOpen(true);
  };
  const openEdit = (row) => {
    setEditingRow(row);
    const productTypePrices = parsePricesCsv(row.product_type_prices_csv);
    form.setFieldsValue({
      name: row.name,
      sort_order: Number(row.sort_order || 0),
      is_active: !!row.is_active,
      product_type_prices: productTypePrices.length ? productTypePrices : [{ product_type_id: undefined, admin_price_extra: 0 }],
    });
    setSelectedPreviewFont(row.name || 'Open Sans');
    setModalOpen(true);
  };

  const normalizePrices = (prices) => {
    const dedup = new Map();
    (Array.isArray(prices) ? prices : []).forEach((item) => {
      const productTypeId = Number(item?.product_type_id);
      const adminPriceExtra = Number(item?.admin_price_extra ?? 0);
      if (!Number.isFinite(productTypeId)) return;
      dedup.set(productTypeId, {
        product_type_id: productTypeId,
        admin_price_extra: Number.isFinite(adminPriceExtra) ? adminPriceExtra : 0,
      });
    });
    return Array.from(dedup.values());
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        name: values.name,
        sort_order: Number(values.sort_order || 0),
        is_active: !!values.is_active,
        product_type_prices: normalizePrices(values.product_type_prices),
      };
      if (!payload.product_type_prices.length) {
        throw new Error('Please add at least one product type price');
      }
      if (editingRow) await updateItem({ id: editingRow.id, body: payload }).unwrap();
      else await createItem(payload).unwrap();
      message.success(editingRow ? 'Font updated' : 'Font created');
      setModalOpen(false);
      form.resetFields();
    } catch (err) {
      message.error(err?.data?.message || err?.message || 'Operation failed');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 70 },
    {
      title: 'Font',
      dataIndex: 'name',
      render: (v) => <span style={{ fontFamily: `'${v}', sans-serif`, fontSize: 18 }}>{v}</span>,
    },
    {
      title: 'Product Type Prices',
      dataIndex: 'product_type_prices_csv',
      render: (csv) => {
        const list = parsePricesCsv(csv);
        if (!list.length) return '-';
        return (
          <Space wrap>
            {list.map((x) => {
              const pt = productTypes.find((p) => String(p.id) === String(x.product_type_id));
              return (
                <Tag key={`${x.product_type_id}-${x.admin_price_extra}`} color="blue">
                  {pt?.name || `PT ${x.product_type_id}`}: ₹{Number(x.admin_price_extra || 0).toFixed(2)}
                </Tag>
              );
            })}
          </Space>
        );
      },
    },
    { title: 'Sort', dataIndex: 'sort_order', width: 80 },
    { title: 'Status', dataIndex: 'is_active', width: 100, render: (v) => (v ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>) },
    {
      title: 'Actions', width: 110, render: (_, row) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(row)} />
          {/* Delete disabled — use is_active instead to preserve cart/order references
          <Popconfirm title="Delete font?" onConfirm={() => deleteItem(row.id).unwrap().then(() => message.success('Deleted')).catch(() => message.error('Delete failed'))}>
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
        <h2 style={{ margin: 0 }}>Fonts</h2>
        <Space wrap>
          <Input allowClear prefix={<SearchOutlined />} placeholder="Search font" style={{ width: 220 }} value={searchText} onChange={(e) => setSearchText(e.target.value)} />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add Font</Button>
        </Space>
      </div>
      <Table rowKey="id" loading={isLoading} dataSource={filtered} columns={columns} />

      <Modal title={editingRow ? 'Edit Font' : 'Create Font'} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={handleSubmit} confirmLoading={creating || updating}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Google Font" rules={[{ required: true, message: 'Please select a Google Font' }]}>
            <Select
              showSearch
              placeholder="Select font family"
              options={GOOGLE_FONT_FAMILIES.map((font) => ({ label: font, value: font }))}
              onChange={(value) => setSelectedPreviewFont(value)}
              filterOption={(input, option) => String(option?.label || '').toLowerCase().includes(input.toLowerCase())}
            />
          </Form.Item>
          <div style={{ marginBottom: 12, padding: 10, borderRadius: 8, border: '1px solid #f0f0f0' }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Preview</div>
            <div style={{ fontFamily: `'${selectedPreviewFont}', sans-serif`, fontSize: 24 }}>
              The font will be applied to this text.
            </div>
          </div>
          <Form.Item name="sort_order" label="Sort Order"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="is_active" label="Active" valuePropName="checked"><Switch /></Form.Item>
          <Form.List name="product_type_prices">
            {(fields, { add, remove }) => (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontWeight: 600 }}>Admin Price by Product Type</div>
                {fields.map((field) => (
                  <Space key={field.key} align="start" style={{ display: 'flex' }}>
                    <Form.Item
                      {...field}
                      name={[field.name, 'product_type_id']}
                      rules={[{ required: true, message: 'Select product type' }]}
                      style={{ minWidth: 220 }}
                    >
                      <Select
                        placeholder="Product Type"
                        options={(Array.isArray(productTypes) ? productTypes : []).map((p) => ({ label: p.name, value: p.id }))}
                      />
                    </Form.Item>
                    <Form.Item
                      {...field}
                      name={[field.name, 'admin_price_extra']}
                      rules={[{ required: true, message: 'Enter price' }]}
                      style={{ minWidth: 180 }}
                    >
                      <InputNumber min={0} step={0.01} placeholder="Admin Price Extra" style={{ width: '100%' }} />
                    </Form.Item>
                    <Button danger type="link" onClick={() => remove(field.name)}>Remove</Button>
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add({ product_type_id: undefined, admin_price_extra: 0 })}>
                  Add Product Type Price
                </Button>
              </div>
            )}
          </Form.List>
        </Form>
      </Modal>
    </>
  );
}

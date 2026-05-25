import { useState } from 'react';
import { Table, Button, Space, Tag, Select, message, Tooltip, Typography } from 'antd';
import { CheckOutlined, CloseOutlined, StopOutlined } from '@ant-design/icons';
import {
  useGetVendorsQuery,
  useApproveVendorMutation,
  useRejectVendorMutation,
  useToggleVendorBlockMutation,
} from '../api/adminApi';

const empty = (v) => (
  v ? v : <Typography.Text type="secondary">—</Typography.Text>
);

const cellMiddle = { style: { verticalAlign: 'middle' } };

export default function Vendors() {
  const [filters, setFilters] = useState({});
  const { data, isLoading } = useGetVendorsQuery(filters);
  const [approve] = useApproveVendorMutation();
  const [reject] = useRejectVendorMutation();
  const [toggleBlock] = useToggleVendorBlockMutation();

  const list = data?.data ?? [];
  const pagination = data?.pagination;

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 64,
      fixed: 'left',
      align: 'center',
      onCell: () => cellMiddle,
    },
    {
      title: 'Logo',
      dataIndex: 'logo_url',
      key: 'logo_url',
      width: 72,
      align: 'center',
      onCell: () => cellMiddle,
      render: (url) => (
        url ? (
          <img
            src={url}
            alt="logo"
            style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, display: 'block', margin: '0 auto' }}
          />
        ) : (
          <Typography.Text type="secondary">—</Typography.Text>
        )
      ),
    },
    {
      title: 'Business',
      dataIndex: 'business_name',
      key: 'business_name',
      width: 160,
      fixed: 'left',
      ellipsis: true,
      onCell: () => cellMiddle,
      render: (v) => empty(v),
    },
    {
      title: 'GST',
      dataIndex: 'gst_number',
      key: 'gst_number',
      width: 140,
      ellipsis: true,
      onCell: () => cellMiddle,
      render: (v) => empty(v),
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      width: 200,
      ellipsis: { showTitle: true },
      onCell: () => cellMiddle,
      render: (v) => empty(v),
    },
    {
      title: 'City',
      dataIndex: 'city',
      key: 'city',
      width: 110,
      ellipsis: true,
      onCell: () => cellMiddle,
      render: (v) => empty(v),
    },
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      width: 110,
      ellipsis: true,
      onCell: () => cellMiddle,
      render: (v) => empty(v),
    },
    {
      title: 'Pincode',
      dataIndex: 'pincode',
      key: 'pincode',
      width: 90,
      align: 'center',
      onCell: () => cellMiddle,
      render: (v) => empty(v),
    },
    {
      title: 'Owner',
      dataIndex: 'owner_name',
      key: 'owner_name',
      width: 130,
      ellipsis: true,
      onCell: () => cellMiddle,
      render: (v) => empty(v),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      ellipsis: { showTitle: true },
      onCell: () => cellMiddle,
      render: (v) => empty(v),
    },
    {
      title: 'Status',
      key: 'status',
      width: 120,
      align: 'center',
      onCell: () => cellMiddle,
      render: (_, row) => (
        <Space direction="vertical" size={4} style={{ width: '100%', alignItems: 'center' }}>
          {row.is_approved ? <Tag color="green">Approved</Tag> : <Tag color="orange">Pending</Tag>}
          {!row.is_active && <Tag color="red">Blocked</Tag>}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
      align: 'center',
      onCell: () => cellMiddle,
      render: (_, row) => (
        <Space direction="vertical" size={0} style={{ width: '100%', alignItems: 'stretch' }}>
          {!row.is_approved && (
            <>
              <Tooltip title="Approve vendor">
                <Button
                  type="link"
                  size="small"
                  icon={<CheckOutlined />}
                  style={{ padding: '0 4px', height: 28 }}
                  onClick={() => approve(row.id).then(() => message.success('Approved')).catch(() => message.error('Failed'))}
                >
                  Approve
                </Button>
              </Tooltip>
              <Tooltip title="Reject vendor">
                <Button
                  type="link"
                  size="small"
                  danger
                  icon={<CloseOutlined />}
                  style={{ padding: '0 4px', height: 28 }}
                  onClick={() => reject(row.id).then(() => message.success('Rejected')).catch(() => message.error('Failed'))}
                >
                  Reject
                </Button>
              </Tooltip>
            </>
          )}
          <Tooltip title={row.is_active ? 'Block vendor' : 'Unblock vendor'}>
            <Button
              type="link"
              size="small"
              icon={<StopOutlined />}
              style={{ padding: '0 4px', height: 28 }}
              onClick={() => toggleBlock(row.id).then(() => message.success('Updated')).catch(() => message.error('Failed'))}
            >
              {row.is_active ? 'Block' : 'Unblock'}
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Vendors</h2>
        <Select
          placeholder="Approval"
          allowClear
          style={{ width: 140 }}
          onChange={(v) => setFilters((f) => ({ ...f, is_approved: v }))}
        >
          <Select.Option value="true">Approved</Select.Option>
          <Select.Option value="false">Pending</Select.Option>
        </Select>
      </div>
      <Table
        dataSource={list}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        scroll={{ x: 1500 }}
        size="middle"
        pagination={
          pagination
            ? { total: pagination.total, pageSize: pagination.limit, current: pagination.page, showSizeChanger: false }
            : false
        }
      />
    </>
  );
}

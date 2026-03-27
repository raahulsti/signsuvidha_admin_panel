import { useState } from 'react';
import { Table, Button, Space, Tag, Select, message } from 'antd';
import { CheckOutlined, CloseOutlined, StopOutlined } from '@ant-design/icons';
import { useGetVendorsQuery, useApproveVendorMutation, useRejectVendorMutation, useToggleVendorBlockMutation } from '../api/adminApi';

export default function Vendors() {
  const [filters, setFilters] = useState({});
  const { data, isLoading } = useGetVendorsQuery(filters);
  const [approve] = useApproveVendorMutation();
  const [reject] = useRejectVendorMutation();
  const [toggleBlock] = useToggleVendorBlockMutation();

  const list = data?.data ?? [];
  const pagination = data?.pagination;

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
    { title: 'Business', dataIndex: 'business_name', key: 'business_name' },
    { title: 'Owner', dataIndex: 'owner_name', key: 'owner_name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Status', key: 'status', width: 140, render: (_, row) => (
      <Space>
        {row.is_approved ? <Tag color="green">Approved</Tag> : <Tag color="orange">Pending</Tag>}
        {!row.is_active && <Tag color="red">Blocked</Tag>}
      </Space>
    ) },
    { title: 'Actions', key: 'actions', width: 180, render: (_, row) => (
      <Space>
        {!row.is_approved && (
          <>
            <Button type="link" size="small" icon={<CheckOutlined />} onClick={() => approve(row.id).then(() => message.success('Approved')).catch(() => message.error('Failed'))}>Approve</Button>
            <Button type="link" size="small" danger icon={<CloseOutlined />} onClick={() => reject(row.id).then(() => message.success('Rejected')).catch(() => message.error('Failed'))}>Reject</Button>
          </>
        )}
        <Button type="link" size="small" icon={<StopOutlined />} onClick={() => toggleBlock(row.id).then(() => message.success('Updated')).catch(() => message.error('Failed'))}>
          {row.is_active ? 'Block' : 'Unblock'}
        </Button>
      </Space>
    ) },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Vendors</h2>
        <Select placeholder="Approval" allowClear style={{ width: 120 }} onChange={(v) => setFilters((f) => ({ ...f, is_approved: v }))}>
          <Select.Option value="true">Approved</Select.Option>
          <Select.Option value="false">Pending</Select.Option>
        </Select>
      </div>
      <Table dataSource={list} columns={columns} rowKey="id" loading={isLoading} pagination={pagination ? { total: pagination.total, pageSize: pagination.limit, current: pagination.page } : false} />
    </>
  );
}

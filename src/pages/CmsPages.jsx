import { useEffect, useState } from 'react';
import { Card, Tabs, Form, Input, Switch, Button, Spin, message } from 'antd';
import RichTextEditor from '../components/RichTextEditor';
import {
  useGetCmsPagesQuery,
  useGetCmsPageBySlugQuery,
  useUpdateCmsPageMutation,
} from '../api/adminApi';

const PAGES = [
  { slug: 'terms-conditions', label: 'Terms & Conditions' },
  { slug: 'about-us', label: 'About Us' },
  { slug: 'privacy-policy', label: 'Privacy Policy' },
];

function PageEditor({ slug, label }) {
  const [form] = Form.useForm();
  const [content, setContent] = useState('');
  const { data, isLoading, isFetching } = useGetCmsPageBySlugQuery(slug);
  const [updatePage, { isLoading: saving }] = useUpdateCmsPageMutation();

  const page = data?.data ?? data ?? {};

  useEffect(() => {
    if (!page?.slug) return;
    form.setFieldsValue({
      title: page.title,
      is_active: !!page.is_active,
    });
    setContent(page.content || '');
  }, [page, form]);

  const onSave = async () => {
    try {
      const values = await form.validateFields();
      await updatePage({
        slug,
        body: {
          title: values.title,
          content,
          is_active: values.is_active,
        },
      }).unwrap();
      message.success(`${label} saved`);
    } catch (e) {
      message.error(e?.data?.message || e?.message || 'Save failed');
    }
  };

  if (isLoading) return <Spin />;

  return (
    <Form form={form} layout="vertical" style={{ maxWidth: 900 }}>
      <Form.Item name="title" label="Page title" rules={[{ required: true, min: 2 }]}>
        <Input placeholder={label} />
      </Form.Item>
      <Form.Item label="Content (HTML)">
        <RichTextEditor value={content} onChange={setContent} placeholder={`Write ${label}...`} />
      </Form.Item>
      <Form.Item name="is_active" label="Published" valuePropName="checked">
        <Switch checkedChildren="Live" unCheckedChildren="Hidden" />
      </Form.Item>
      <Button type="primary" onClick={onSave} loading={saving || isFetching}>
        Save {label}
      </Button>
    </Form>
  );
}

export default function CmsPages() {
  const { data, isLoading } = useGetCmsPagesQuery();
  const rows = data?.data ?? data ?? [];
  const [activeKey, setActiveKey] = useState(PAGES[0].slug);

  const tabItems = PAGES.map((p) => ({
    key: p.slug,
    label: p.label,
    children: <PageEditor slug={p.slug} label={p.label} />,
  }));

  return (
    <Card
      title="CMS Pages"
      extra={!isLoading && <span style={{ color: '#888' }}>{rows.length} pages</span>}
    >
      <Tabs activeKey={activeKey} onChange={setActiveKey} items={tabItems} />
    </Card>
  );
}

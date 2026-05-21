import { Card, Col, Row, Image, Tag, Typography, Divider, Collapse } from 'antd';

const { Text } = Typography;

function SpecLine({ label, value, extra }) {
  if (value == null || value === '') return null;
  return (
    <div style={{ marginBottom: 4 }}>
      <Text type="secondary">{label}: </Text>
      <Text>{value}</Text>
      {extra}
    </div>
  );
}

function EntityBlock({ title, entity, imageKey = 'file_url' }) {
  if (!entity) return null;
  const img = entity.image || entity[imageKey] || entity.thumbnail_url;
  return (
    <div style={{ marginBottom: 8 }}>
      <Text strong>{title}</Text>
      <SpecLine label="Name" value={entity.name} />
      {entity.wallpaper_type && <SpecLine label="Type" value={entity.wallpaper_type} />}
      {entity.shape && <SpecLine label="Shape" value={entity.shape} />}
      {entity.size && <SpecLine label="Size" value={entity.size} />}
      {entity.height && <SpecLine label="Height" value={entity.height} />}
      {entity.width && <SpecLine label="Width" value={entity.width} />}
      {entity.border_is_lit != null && (
        <SpecLine label="Lit" value={entity.border_is_lit ? 'Yes' : 'No'} />
      )}
      {entity.category && <SpecLine label="Category" value={entity.category} />}
      {entity.description && <SpecLine label="Description" value={entity.description} />}
      {entity.hex_code && (
        <SpecLine
          label="Color"
          value={entity.hex_code}
          extra={<span style={{ display: 'inline-block', width: 14, height: 14, background: entity.hex_code, border: '1px solid #ccc', marginLeft: 6, verticalAlign: 'middle' }} />}
        />
      )}
      {img && (
        <Image src={img} alt={title} width={72} height={72} style={{ objectFit: 'cover', marginTop: 4, borderRadius: 4 }} />
      )}
    </div>
  );
}

function OrderItemCard({ item, index }) {
  if (item.item_type === 'listed' || item.listed_product) {
    const lp = item.listed_product || {};
    return (
      <Card
        size="small"
        title={`Item ${index + 1}: ${lp.name || 'Listed product'}`}
        extra={<Tag color="purple">Listed · {lp.size}</Tag>}
        style={{ marginBottom: 16 }}
      >
        {lp.thumbnail_url && <Image src={lp.thumbnail_url} width={120} style={{ marginBottom: 8 }} />}
        <SpecLine label="Size" value={lp.size} />
        <SpecLine label="Qty" value={item.quantity} />
        <SpecLine label="Total" value={`₹${Number(item.pricing?.total_price || 0).toFixed(2)}`} />
      </Card>
    );
  }
  const preview = item.images?.preview_image_url || item.images?.uploaded_image_url;
  const dims = item.dimensions || {};
  const dimLabel = dims.unit_name
    ? `${dims.height} × ${dims.width} ${dims.unit_name}`
    : item.is_lollipop
      ? 'Fixed pricing'
      : `${dims.height} × ${dims.width}`;

  const breakdown = item.pricing?.breakdown || {};
  const breakdownRows = Object.entries(breakdown)
    .filter(([, v]) => Number(v) > 0)
    .map(([k, v]) => ({ key: k, label: k.replace(/_/g, ' '), value: Number(v).toFixed(2) }));

  return (
    <Card
      size="small"
      title={`Item ${index + 1}: ${item.product_type?.name || 'Product'}`}
      extra={<Tag color="blue">₹{Number(item.pricing?.total_price || 0).toFixed(2)}</Tag>}
      style={{ marginBottom: 16 }}
    >
      <Row gutter={16}>
        <Col xs={24} md={8}>
          {preview ? (
            <Image src={preview} alt="Preview" style={{ maxWidth: '100%', borderRadius: 8 }} />
          ) : (
            <Text type="secondary">No preview image</Text>
          )}
          {item.images?.uploaded_image_url && item.images.uploaded_image_url !== preview && (
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Uploaded</Text>
              <br />
              <Image src={item.images.uploaded_image_url} width={80} style={{ marginTop: 4 }} />
            </div>
          )}
        </Col>
        <Col xs={24} md={16}>
          <SpecLine label="Quantity" value={item.quantity} />
          <SpecLine label="Dimensions" value={dimLabel} />
          <Divider style={{ margin: '8px 0' }} />
          <EntityBlock title="Material" entity={item.material} />
          <EntityBlock title="Material style" entity={item.material_style} />
          <EntityBlock title="Frame" entity={item.frame} />
          <EntityBlock title="Wallpaper" entity={item.wallpaper} />
          <EntityBlock title="Border base" entity={item.add_border} />
          <EntityBlock title="Lollipop element" entity={item.lollipop_element} imageKey="image" />
          <EntityBlock title="Base" entity={item.base} />
          <EntityBlock title="Thickness" entity={item.thickness} />
          <EntityBlock title="Element" entity={item.element} />
          <EntityBlock title="Color" entity={item.color} />
          <EntityBlock title="Font" entity={item.font} />
          <EntityBlock title="Illumination" entity={item.illumination_option} />
          {item.text_layers?.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <Text strong>Text layers</Text>
              <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
                {item.text_layers.map((layer, i) => (
                  <li key={i}>
                    <Text>
                      {layer.text || layer.content || JSON.stringify(layer)}
                      {layer.fontSize ? ` (${layer.fontSize}px)` : ''}
                    </Text>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {breakdownRows.length > 0 && (
            <Collapse
              size="small"
              style={{ marginTop: 12 }}
              items={[{
                key: 'pricing',
                label: 'Price breakdown',
                children: (
                  <div>
                    {breakdownRows.map((r) => (
                      <SpecLine key={r.key} label={r.label} value={`₹${r.value}`} />
                    ))}
                    <SpecLine label="Unit price" value={`₹${Number(item.pricing?.unit_price || 0).toFixed(2)}`} />
                  </div>
                ),
              }]}
            />
          )}
        </Col>
      </Row>
    </Card>
  );
}

export default function OrderItemsDetail({ items = [] }) {
  if (!items.length) return <Text type="secondary">No items in this order</Text>;
  return items.map((item, index) => <OrderItemCard key={item.id || index} item={item} index={index} />);
}

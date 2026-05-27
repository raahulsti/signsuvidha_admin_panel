import { Card, Col, Row, Image, Tag, Typography, Divider, Collapse } from 'antd';

const { Text } = Typography;

const BREAKDOWN_LABELS = {
  price_per_sqft: 'Rate / sq ft',
  material_cost: 'Material',
  material_style_cost: 'Material style',
  frame_cost: 'Frame',
  wallpaper_cost: 'Wallpaper',
  add_border_cost: 'Border',
  lollipop_element_cost: 'Lollipop element',
  pylon_category_cost: 'Pylon category',
  pylon_tiles_cost: 'Pylon tiles',
  base_cost: 'Base',
  thickness_cost: 'Thickness',
  element_cost: 'Element',
  color_extra: 'Color extra',
  font_extra: 'Font extra',
  illumination_cost: 'Illumination',
  material_style_price_per_sqft: 'Material style rate',
  frame_price_per_sqft: 'Frame rate',
  wallpaper_price_per_sqft: 'Wallpaper rate',
  add_border_base_price: 'Border base',
  add_border_lit_extra: 'Border lit extra',
  base_price_per_sqft: 'Base rate',
  thickness_price_per_sqft: 'Thickness rate',
  pylon_category_price: 'Pylon category price',
  pylon_tiles_price: 'Pylon tile unit price',
  illumination_rate_per_sqft: 'Illumination rate',
};

const fmt = (v) => `₹${Number(v || 0).toFixed(2)}`;

function formatLayerLabel(key) {
  return String(key).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatLayerValue(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function colorSwatch(hex) {
  if (!hex) return null;
  const raw = String(hex).trim();
  const css = raw.startsWith('#') ? raw : `#${raw}`;
  return (
    <span
      style={{
        display: 'inline-block',
        width: 14,
        height: 14,
        background: css,
        border: '1px solid #ccc',
        borderRadius: 2,
        flexShrink: 0,
      }}
    />
  );
}

function SpecLine({ label, value, extra, strong }) {
  if (value == null || value === '') return null;
  return (
    <div style={{ marginBottom: 4, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
      <Text type="secondary" style={{ minWidth: 120, flexShrink: 0 }}>{label}:</Text>
      <Text strong={strong} style={{ wordBreak: 'break-word' }}>{value}</Text>
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
          extra={colorSwatch(entity.hex_code)}
        />
      )}
      {img && (
        <Image src={img} alt={title} width={72} height={72} style={{ objectFit: 'cover', marginTop: 4, borderRadius: 4 }} />
      )}
    </div>
  );
}

function TextLayersBlock({ layers }) {
  if (!layers?.length) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <Text strong>Text layers</Text>
      {layers.map((layer, i) => {
        const entries = Object.entries(layer || {}).filter(([, v]) => v != null && v !== '');
        return (
          <div
            key={i}
            style={{
              marginTop: 8,
              padding: '10px 12px',
              background: '#fafafa',
              borderRadius: 6,
              border: '1px solid #f0f0f0',
            }}
          >
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
              Layer {i + 1}
            </Text>
            {entries.length === 0 ? (
              <Text type="secondary">Empty layer</Text>
            ) : (
              entries.map(([key, value]) => {
                const display = formatLayerValue(value);
                if (display == null) return null;
                const isColor = key === 'color' || key.toLowerCase().includes('color');
                return (
                  <div
                    key={key}
                    style={{
                      display: 'flex',
                      gap: 8,
                      marginBottom: 4,
                      alignItems: isColor ? 'center' : 'flex-start',
                    }}
                  >
                    <Text type="secondary" style={{ minWidth: 100, flexShrink: 0 }}>
                      {formatLayerLabel(key)}
                    </Text>
                    {isColor ? (
                      <>
                        {colorSwatch(display)}
                        <Text style={{ wordBreak: 'break-word' }}>{display}</Text>
                      </>
                    ) : (
                      <Text style={{ wordBreak: 'break-word', flex: 1 }}>{display}</Text>
                    )}
                  </div>
                );
              })
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrderTotalsCard({ amounts }) {
  if (!amounts) return null;
  const subtotal = amounts.subtotal ?? amounts.total_amount;
  const gstPercent = Number(amounts.gst_percent || 0);
  const gstAmount = Number(amounts.gst_amount || 0);
  const shipping = Number(amounts.shipping_cost || 0);
  const payable = amounts.payable_amount ?? amounts.total_amount;

  return (
    <Card size="small" title="Order totals" style={{ marginTop: 16 }}>
      <SpecLine label="Subtotal" value={fmt(subtotal)} />
      {shipping > 0 && <SpecLine label="Shipping" value={fmt(shipping)} />}
      {(gstPercent > 0 || gstAmount > 0) && (
        <SpecLine label={`GST (${gstPercent.toFixed(2)}%)`} value={fmt(gstAmount)} />
      )}
      <SpecLine label="Payable" value={fmt(payable)} strong />
    </Card>
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
        {(lp.height || lp.width) && (
          <SpecLine label="Dimensions" value={[lp.height, lp.width].filter(Boolean).join(' × ')} />
        )}
        <SpecLine label="Qty" value={item.quantity} />
        <EntityBlock title="Color" entity={item.color} />
        <SpecLine label="Total" value={fmt(item.pricing?.total_price)} />
      </Card>
    );
  }
  const preview = item.images?.preview_image_url || item.images?.uploaded_image_url;
  const dims = item.dimensions || {};
  const dimLabel = dims.unit_name
    ? `${dims.height} × ${dims.width} ${dims.unit_name}`
    : item.is_lollipop || item.is_pylon
      ? 'Fixed pricing'
      : `${dims.height} × ${dims.width}`;

  const breakdown = item.pricing?.breakdown || {};
  const breakdownRows = Object.entries(breakdown)
    .filter(([, v]) => Number(v) > 0)
    .map(([k, v]) => ({
      key: k,
      label: BREAKDOWN_LABELS[k] || k.replace(/_/g, ' '),
      value: Number(v).toFixed(2),
    }));

  return (
    <Card
      size="small"
      title={`Item ${index + 1}: ${item.product_type?.name || 'Product'}`}
      extra={<Tag color="blue">{fmt(item.pricing?.total_price)}</Tag>}
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
          <EntityBlock title="Pylon" entity={item.pylon} />
          {item.pylon_category && (
            <div style={{ marginBottom: 8 }}>
              <Text strong>Pylon category</Text>
              <SpecLine label="Name" value={item.pylon_category.name} />
              <SpecLine label="Tiles" value={item.pylon_category.tiles_name} />
              <SpecLine label="Tiles count" value={item.tiles ?? item.pylon_tiles_count} />
              <SpecLine label="Category price" value={fmt(item.pylon_category.category_price)} />
              <SpecLine label="Tile unit price" value={fmt(item.pylon_category.tiles_price)} />
            </div>
          )}
          {item.pylon_tiles_images?.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <Text strong>Tile images</Text>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                {item.pylon_tiles_images.map((url, i) => (
                  <Image key={i} src={url} alt={`Tile ${i + 1}`} width={72} height={72} style={{ objectFit: 'cover', borderRadius: 4 }} />
                ))}
              </div>
            </div>
          )}
          <EntityBlock title="Base" entity={item.base} />
          <EntityBlock title="Thickness" entity={item.thickness} />
          <EntityBlock title="Element" entity={item.element} />
          <EntityBlock title="Color" entity={item.color} />
          <EntityBlock title="Font" entity={item.font} />
          <EntityBlock title="Illumination" entity={item.illumination_option} />
          <TextLayersBlock layers={item.text_layers} />
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
                      <SpecLine key={r.key} label={r.label} value={fmt(r.value)} />
                    ))}
                    <Divider style={{ margin: '8px 0' }} />
                    <SpecLine label="Unit price" value={fmt(item.pricing?.unit_price)} />
                    <SpecLine label="Line total" value={fmt(item.pricing?.total_price)} strong />
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

export default function OrderItemsDetail({ items = [], orderAmounts }) {
  if (!items.length) return <Text type="secondary">No items in this order</Text>;
  return (
    <>
      {items.map((item, index) => (
        <OrderItemCard key={item.id || index} item={item} index={index} />
      ))}
      <OrderTotalsCard amounts={orderAmounts} />
    </>
  );
}

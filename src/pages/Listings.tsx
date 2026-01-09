import React, { useMemo, useState } from 'react';
import { Button, Drawer, Dropdown, Image, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMockStore } from '../stores/mockStore';
import type { Product } from '../types/models';
import { computeListingStatus } from '../utils/kpis';
import type { User } from '../types/models';

const { Text } = Typography;

function statusTag(status: ReturnType<typeof computeListingStatus>) {
  if (status === 'draft') return <Tag color="default">TASLAK</Tag>;
  if (status === 'exchanged') return <Tag color="green">TAKASLANDI</Tag>;
  return <Tag color="blue">AKTİF</Tag>;
}

function conditionLabel(c: string) {
  if (c === 'new') return 'yeni';
  if (c === 'slightly-used') return 'az kullanılmış';
  if (c === 'used') return 'kullanılmış';
  return c;
}

function premiumTypeLabel(t?: string | null) {
  if (!t || t === 'none') return '—';
  if (t === 'featured') return 'ÖNE ÇIKAN';
  if (t === 'vitrin') return 'VİTRİN';
  return String(t).toUpperCase();
}

const Listings: React.FC = () => {
  const products = useMockStore((s) => s.db.products);
  const users = useMockStore((s) => s.db.users);
  const togglePremium = useMockStore((s) => s.toggleProductPremium);
  const toggleHidden = useMockStore((s) => s.toggleProductHidden);
  const markExchanged = useMockStore((s) => s.markProductExchanged);

  const [selected, setSelected] = useState<Product | null>(null);

  type ListingRow = Product & {
    ownerUser?: User;
    computedStatus: ReturnType<typeof computeListingStatus>;
    key: string;
  };

  const data = useMemo((): ListingRow[] => {
    return products.map((p) => ({
      ...p,
      ownerUser: users.find((u) => String(u.id) === String(p.ownerId)),
      computedStatus: computeListingStatus(p),
      key: String(p.id),
    }));
  }, [products, users]);

  const columns: ColumnsType<ListingRow> = [
    {
      title: 'Görsel',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 90,
      render: (url: string | null) => (url ? <Image width={56} height={56} src={url} /> : <Text type="secondary">—</Text>),
    },
    { title: 'İlan Adı', dataIndex: 'name', key: 'name', width: 260, ellipsis: true },
    {
      title: 'Kategori',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 160,
      ellipsis: true,
      filters: Array.from(new Set(products.map((p) => p.categoryName))).map((c) => ({ text: c, value: c })),
      onFilter: (value, record) => record.categoryName === value,
    },
    {
      title: 'Sahip',
      key: 'owner',
      width: 200,
      render: (_value, r) => {
        const u = r.ownerUser;
        return u ? (
          <Space direction="vertical" size={0}>
            <Text>{u.fullName}</Text>
            <Text type="secondary">{u.username}</Text>
          </Space>
        ) : (
          <Text type="secondary">—</Text>
        );
      },
    },
    {
      title: 'Durum',
      dataIndex: 'computedStatus',
      key: 'computedStatus',
      width: 120,
      filters: [
        { text: 'aktif', value: 'active' },
        { text: 'taslak', value: 'draft' },
        { text: 'takaslandı', value: 'exchanged' },
      ],
      onFilter: (value, record) => record.computedStatus === value,
      render: (s: ReturnType<typeof computeListingStatus>) => statusTag(s),
    },
    {
      title: 'Kondisyon',
      dataIndex: 'condition',
      key: 'condition',
      filters: [
        { text: 'yeni', value: 'new' },
        { text: 'az kullanılmış', value: 'slightly-used' },
        { text: 'kullanılmış', value: 'used' },
      ],
      onFilter: (value, record) => record.condition === value,
      render: (c: string) => <Tag>{conditionLabel(c)}</Tag>,
      width: 140,
    },
    {
      title: 'Premium',
      dataIndex: 'premium',
      key: 'premium',
      filters: [
        { text: 'evet', value: true },
        { text: 'hayır', value: false },
      ],
      onFilter: (value, record) => record.premium === value,
      render: (p: boolean) => (p ? <Tag color="purple">EVET</Tag> : <Tag>HAYIR</Tag>),
      width: 110,
    },
    {
      title: 'Premium Tipi',
      dataIndex: 'premiumType',
      key: 'premiumType',
      width: 130,
      filters: [
        { text: 'öne çıkan', value: 'featured' },
        { text: 'vitrin', value: 'vitrin' },
        { text: 'yok', value: 'none' },
      ],
      onFilter: (value, record) => String(record.premiumType ?? 'none') === String(value),
      render: (t?: string | null) => {
        const label = premiumTypeLabel(t);
        if (!t || t === 'none') return <Text type="secondary">—</Text>;
        return <Tag color={t === 'vitrin' ? 'purple' : 'blue'}>{label}</Tag>;
      },
    },
    { title: 'Görüntülenme', dataIndex: 'viewCount', key: 'viewCount', sorter: (a, b) => a.viewCount - b.viewCount, width: 120 },
    { title: 'Favori', dataIndex: 'favoritesCount', key: 'favoritesCount', sorter: (a, b) => a.favoritesCount - b.favoritesCount, width: 90 },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 170,
      fixed: 'right',
      render: (_value, r) => {
        const items = [
          {
            key: 'togglePremium',
            label: 'Premium ayarla',
            onClick: () => togglePremium(r.id),
          },
          {
            key: 'toggleExchanged',
            label: r.isExchanged ? 'Takaslandı işaretini kaldır' : 'Takaslandı olarak işaretle',
            onClick: () => markExchanged(r.id, !r.isExchanged),
          },
          {
            key: 'toggleHidden',
            label: r.hidden ? 'İlanı göster' : 'İlanı gizle',
            onClick: () => toggleHidden(r.id),
          },
        ];

        return (
          <Space>
            <Button size="small" onClick={() => setSelected(r)}>
              Görüntüle
            </Button>
            <Dropdown trigger={['click']} menu={{ items }}>
              <Button size="small">Diğer</Button>
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Typography.Title level={3} style={{ margin: 0 }}>İlanlar</Typography.Title>
        <Table
          columns={columns}
          dataSource={data}
          rowKey={(r) => String(r.id)}
          pagination={{
            pageSize: 25,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} kayıt`,
          }}
          size="middle"
          sticky
          scroll={{ x: 1600 }}
        />
      </Space>

      <Drawer
        title={selected?.name}
        open={!!selected}
        onClose={() => setSelected(null)}
        width={720}
      >
        {selected && (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Space wrap>
              {statusTag(computeListingStatus(selected))}
              {selected.premium ? <Tag color="purple">PREMIUM</Tag> : <Tag>NORMAL</Tag>}
              {selected.hidden ? <Tag color="red">GİZLİ</Tag> : <Tag color="green">GÖRÜNÜR</Tag>}
              <Tag>{premiumTypeLabel(selected.premiumType)}</Tag>
            </Space>

            <Text type="secondary">{selected.location}</Text>
            <Typography.Paragraph>{selected.description}</Typography.Paragraph>

            <Space wrap>
              {selected.tags.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </Space>

            <div>
              <Typography.Title level={5}>Galeri</Typography.Title>
              <Space wrap>
                {selected.images.map((url) => (
                  <Image key={url} width={120} height={90} src={url} />
                ))}
              </Space>
            </div>

            <div>
              <Typography.Title level={5}>Takas Edilecekler</Typography.Title>
              {selected.changeProduct.length ? (
                <ul style={{ marginTop: 0 }}>
                  {selected.changeProduct.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              ) : (
                <Text type="secondary">—</Text>
              )}
            </div>
          </Space>
        )}
      </Drawer>
    </div>
  );
};

export default Listings;

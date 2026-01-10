import React, { useMemo, useState } from 'react';
import { Button, Drawer, Dropdown, Image, Space, Table, Tag, Typography, Avatar, Input } from 'antd';
import { EllipsisOutlined, SearchOutlined, EyeOutlined, HeartOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
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

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('tr-TR');
}

function conditionLabel(c: string) {
  if (c === 'new') return 'YENİ';
  if (c === 'slightly-used') return 'AZ KULLANILMIŞ';
  if (c === 'used') return 'KULLANILMIŞ';
  return c.toUpperCase();
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

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Product | null>(null);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 25,
    showSizeChanger: true,
    showTotal: (total) => `Toplam ${total} kayıt`,
  });

  type ListingRow = Product & {
    ownerUser?: User;
    computedStatus: ReturnType<typeof computeListingStatus>;
    key: string;
  };

  const data = useMemo((): ListingRow[] => {
    const normalizedSearch = search.trim().toLowerCase();
    
    return products
      .map((p) => ({
        ...p,
        ownerUser: users.find((u) => String(u.id) === String(p.ownerId)),
        computedStatus: computeListingStatus(p),
        key: String(p.id),
      }))
      .filter((p) => {
        if (!normalizedSearch) return true;
        const inName = p.name.toLowerCase().includes(normalizedSearch);
        const inCategory = p.categoryName.toLowerCase().includes(normalizedSearch);
        const inOwner = p.ownerUser ? (
          p.ownerUser.fullName.toLowerCase().includes(normalizedSearch) || 
          p.ownerUser.username.toLowerCase().includes(normalizedSearch)
        ) : false;
        return inName || inCategory || inOwner;
      });
  }, [products, users, search]);

  const columns: ColumnsType<ListingRow> = [
    {
      title: 'İlan',
      key: 'listing',
      width: 380,
      render: (_value, r) => (
        <Space size={12} align="start">
           {r.imageUrl ? 
              <Image width={56} height={56} src={r.imageUrl} style={{ borderRadius: 6, objectFit: 'cover' }} /> : 
              <div style={{ width: 56, height: 56, background: '#f5f5f5', borderRadius: 6, display:'flex', alignItems:'center', justifyContent:'center' }}><Text type="secondary" style={{fontSize: 10}}>Yok</Text></div>
           }
           <Space direction="vertical" size={2} style={{ maxWidth: 300 }}>
             <Text strong ellipsis style={{ maxWidth: 280 }}>{r.name}</Text>
             <Space size={6} separator={<Text type="secondary">•</Text>}>
                <Text type="secondary" style={{ fontSize: 13 }}>{r.categoryName}</Text>
                <Tag style={{ margin: 0, fontSize: 10 }} variant="filled">{conditionLabel(r.condition)}</Tag>
             </Space>
             <Text type="secondary" style={{ fontSize: 12 }}>{r.location}</Text>
           </Space>
        </Space>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Sahip',
      key: 'owner',
      width: 240,
      render: (_value, r) => {
        const u = r.ownerUser;
        if (!u) return <Text type="secondary">—</Text>;
        return (
          <Space size={10}>
            <Avatar src={u.avatar} />
            <Space direction="vertical" size={0}>
              <Text ellipsis style={{ maxWidth: 160 }}>{u.fullName}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>@{u.username}</Text>
            </Space>
          </Space>
        );
      },
      sorter: (a, b) => (a.ownerUser?.fullName || '').localeCompare(b.ownerUser?.fullName || ''),
    },
    {
      title: 'Durum',
      key: 'status',
      width: 250,
      render: (_value, r) => (
        <Space wrap size={[4, 4]}>
          {statusTag(r.computedStatus)}
          {r.premium && <Tag color="purple">PREMIUM</Tag>}
          {r.hidden && <Tag color="red">GİZLİ</Tag>}
          {r.premiumType && r.premiumType !== 'none' && <Tag color="cyan">{premiumTypeLabel(r.premiumType)}</Tag>}
        </Space>
      ),
      filters: [
        { text: 'Aktif', value: 'active' },
        { text: 'Taslak', value: 'draft' },
        { text: 'Takaslandı', value: 'exchanged' },
        { text: 'Gizli', value: 'hidden' },
        { text: 'Premium', value: 'premium' },
      ],
      onFilter: (value, record) => {
          if (value === 'hidden') return !!record.hidden;
          if (value === 'premium') return !!record.premium;
          return record.computedStatus === value;
      }
    },
    {
      title: 'İstatistik',
      key: 'stats',
      width: 150,
      render: (_v, r) => (
         <Space size={12}>
            <Text type="secondary" title="Görüntülenme" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
               <EyeOutlined /> {r.viewCount}
            </Text>
            <Text type="secondary" title="Favori" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
               <HeartOutlined /> {r.favoritesCount}
            </Text>
         </Space>
      ),
      sorter: (a, b) => a.viewCount - b.viewCount,
    },
    {
      title: 'Oluşturulma',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 130,
      render: (d: string) => <Text type="secondary">{formatDate(d)}</Text>,
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 140,
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
              İncele
            </Button>
            <Dropdown trigger={['click']} menu={{ items }}>
              <Button size="small">...</Button>
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
          <Typography.Title level={3} style={{ margin: 0 }}>İlanlar</Typography.Title>
          <Input.Search
            placeholder="Ara: ilan / kategori / sahip"
            allowClear
            style={{ maxWidth: 420 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Space>

        <Table
          columns={columns}
          dataSource={data}
          rowKey={(r) => String(r.id)}
          pagination={pagination}
          onChange={(p) => setPagination(p)}
          size="middle"
          sticky
          scroll={{ x: 1200 }}
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ padding: '0 16px' }}>
                <Typography.Paragraph type="secondary" ellipsis={{ rows: 2, expandable: true, symbol: 'devamı' }}>
                   {record.description}
                </Typography.Paragraph>
                <Space size={8} wrap>
                  {record.tags.map(t => <Tag key={t}>{t}</Tag>)}
                </Space>
              </div>
            ),
            rowExpandable: (record) => true,
          }}
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
                  <Image key={url} width={120} height={90} src={url} style={{objectFit:'cover', borderRadius:8}} />
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
            
            <div style={{marginTop: 20, paddingTop: 20, borderTop: '1px solid #eee'}}>
               <Typography.Title level={5}>Yönetici İşlemleri</Typography.Title>
               <Space wrap>
                  <Button onClick={() => togglePremium(selected.id)}>
                     {selected.premium ? 'Premium Kaldır' : 'Premium Yap'}
                  </Button>
                  <Button onClick={() => toggleHidden(selected.id)} danger={!selected.hidden}>
                     {selected.hidden ? 'İlanı Yayınla' : 'İlanı Gizle'}
                  </Button>
               </Space>
            </div>
          </Space>
        )}
      </Drawer>
    </div>
  );
};

export default Listings;

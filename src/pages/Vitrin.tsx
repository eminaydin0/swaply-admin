import React, { useMemo, useState } from 'react';
import { Button, Drawer, Dropdown, Space, Table, Tag, Typography, Avatar, Input, Image } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { useMockStore } from '../stores/mockStore';
import type { Product, User } from '../types/models';

const { Text } = Typography;

function premiumTypeLabel(t?: string | null) {
  if (!t || t === 'none') return '—';
  if (t === 'featured') return 'ÖNE ÇIKAN';
  if (t === 'vitrin') return 'VİTRİN';
  return String(t).toUpperCase();
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('tr-TR');
}

const Vitrin: React.FC = () => {
  const db = useMockStore((s) => s.db);
  const togglePremium = useMockStore((s) => s.toggleProductPremium);
  
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Product | null>(null);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
      current: 1,
      pageSize: 25,
      showSizeChanger: true,
      showTotal: (total) => `Toplam ${total} kayıt`,
  });

  type PremiumRow = Product & { owner?: User; key: string };

  const data = useMemo((): PremiumRow[] => {
    const normalizedSearch = search.trim().toLowerCase();
    
    return db.products
      .filter((p) => p.premium === true)
      .map((p) => {
        const owner = db.users.find((u) => String(u.id) === String(p.ownerId));
        return {
          ...p,
          owner,
          key: String(p.id),
        };
      })
      .filter(p => {
          if (!normalizedSearch) return true;
          const inName = p.name.toLowerCase().includes(normalizedSearch);
          const inCat = p.categoryName.toLowerCase().includes(normalizedSearch);
          const inOwner = p.owner ? (p.owner.fullName.toLowerCase().includes(normalizedSearch) || p.owner.username.toLowerCase().includes(normalizedSearch)) : false;
          return inName || inCat || inOwner;
      });
  }, [db.products, db.users, search]);

  const columns: ColumnsType<PremiumRow> = [
    { 
        title: 'Ürün', 
        key: 'product', 
        width: 320,
        render: (_v, r) => (
            <Space align="start" size={12}>
                {r.imageUrl ? 
                   <Image width={50} height={50} src={r.imageUrl} style={{borderRadius: 6, objectFit:'cover'}} /> :
                   <div style={{width: 50, height: 50, background:'#f5f5f5', borderRadius: 6}} />
                }
                <Space direction="vertical" size={2}>
                    <Text strong ellipsis style={{maxWidth: 240}}>{r.name}</Text>
                    <Text type="secondary" style={{fontSize: 12}}>{r.categoryName}</Text>
                </Space>
            </Space>
        ),
        sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Sahip',
      key: 'owner',
      width: 250,
      render: (_value, r) => {
          if (!r.owner) return <Text type="secondary">—</Text>;
          return (
              <Space>
                  <Avatar src={r.owner.avatar} />
                  <Space direction="vertical" size={0}>
                       <Text strong>{r.owner.fullName}</Text>
                       <Text type="secondary" style={{fontSize: 12}}>@{r.owner.username}</Text>
                  </Space>
              </Space>
          )
      },
      sorter: (a, b) => (a.owner?.fullName || '').localeCompare(b.owner?.fullName || ''),
    },
    {
      title: 'Premium Tipi',
      dataIndex: 'premiumType',
      key: 'premiumType',
      width: 140,
      filters: [
        { text: 'öne çıkan', value: 'featured' },
        { text: 'vitrin', value: 'vitrin' },
      ],
      onFilter: (value, record) => record.premiumType === value,
      render: (t: string) => <Tag color={t === 'vitrin' ? 'purple' : 'blue'}>{premiumTypeLabel(t)}</Tag>,
    },
    { 
        title: 'Bitiş Tarihi', 
        dataIndex: 'premiumExpiryDate', 
        key: 'premiumExpiryDate', 
        width: 140,
        render: (d) => <Text type="secondary">{formatDate(d)}</Text>,
        sorter: (a, b) => new Date(a.premiumExpiryDate || '').getTime() - new Date(b.premiumExpiryDate || '').getTime(),
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
      title: 'İşlemler',
      key: 'actions',
      width: 160,
      fixed: 'right',
      render: (_value, r) => {
        const items = [
          { key: 'featured', label: 'Öne çıkar', onClick: () => togglePremium(r.id, 'featured') },
          { key: 'vitrin', label: 'Vitrine al', onClick: () => togglePremium(r.id, 'vitrin') },
          { key: 'remove', label: 'Premium kaldır', danger: true, onClick: () => togglePremium(r.id, 'none') },
        ];

        return (
          <Space>
             <Button size="small" onClick={() => setSelected(r)}>İncele</Button>
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
        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
            <Typography.Title level={3} style={{ margin: 0 }}>Vitrin / Premium</Typography.Title>
            <Input.Search
                placeholder="Ara: ürün / sahip / kategori"
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
        />
      </Space>

      <Drawer
        title={selected?.name}
        open={!!selected}
        onClose={() => setSelected(null)}
        width={600}
      >
        {selected && (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Space align="start" size={16}>
                    {selected.imageUrl ? 
                        <Image width={120} src={selected.imageUrl} style={{borderRadius: 8}} /> :
                        <div style={{width: 120, height: 90, background:'#eee', borderRadius:8}} />
                    }
                    <div>
                        <Typography.Title level={5} style={{marginTop:0}}>{selected.name}</Typography.Title>
                        <Tag color={selected.premiumType === 'vitrin' ? 'purple' : 'blue'}>
                            {premiumTypeLabel(selected.premiumType)}
                        </Tag>
                    </div>
                </Space>

                <div>
                    <Text type="secondary">Kategori</Text>
                    <div>{selected.categoryName}</div>
                </div>

                <div>
                    <Text type="secondary">Açıklama</Text>
                    <Typography.Paragraph>{selected.description}</Typography.Paragraph>
                </div>
                
                <Space wrap>
                    {selected.tags.map(t => <Tag key={t}>{t}</Tag>)}
                </Space>
                
                <div style={{marginTop: 20, paddingTop: 20, borderTop: '1px solid #eee'}}>
                    <Typography.Title level={5}>Yönetim</Typography.Title>
                    <Space wrap>
                        <Button onClick={() => togglePremium(selected.id, 'none')} danger>
                            Premium Kaldır
                        </Button>
                        {selected.premiumType !== 'vitrin' && (
                             <Button onClick={() => togglePremium(selected.id, 'vitrin')}>
                                Vitrine Taşı
                             </Button>
                        )}
                        {selected.premiumType !== 'featured' && (
                             <Button onClick={() => togglePremium(selected.id, 'featured')}>
                                Öne Çıkar
                             </Button>
                        )}
                    </Space>
                </div>
            </Space>
        )}
      </Drawer>
    </div>
  );
};

export default Vitrin;

import React, { useMemo } from 'react';
import { Button, Dropdown, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMockStore } from '../stores/mockStore';
import type { Product, User } from '../types/models';

const Vitrin: React.FC = () => {
  const db = useMockStore((s) => s.db);
  const togglePremium = useMockStore((s) => s.toggleProductPremium);

  type PremiumRow = Product & { owner?: User; key: string };

  const data = useMemo((): PremiumRow[] => {
    return db.products
      .filter((p) => p.premium === true)
      .map((p) => {
        const owner = db.users.find((u) => String(u.id) === String(p.ownerId));
        return {
          ...p,
          owner,
          key: String(p.id),
        };
      });
  }, [db.products, db.users]);

  const columns: ColumnsType<PremiumRow> = [
    { title: 'Ürün', dataIndex: 'name', key: 'name', width: 320, ellipsis: true },
    {
      title: 'Sahip',
      key: 'owner',
      width: 220,
      render: (_value, r) => (
        <Space direction="vertical" size={0}>
          <span>{r.owner?.fullName ?? '—'}</span>
          <Typography.Text type="secondary">{r.owner?.username ?? ''}</Typography.Text>
        </Space>
      ),
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
      render: (t: string) => <Tag color={t === 'vitrin' ? 'purple' : 'blue'}>{t === 'vitrin' ? 'VİTRİN' : 'ÖNE ÇIKAN'}</Tag>,
    },
    { title: 'Bitiş', dataIndex: 'premiumExpiryDate', key: 'premiumExpiryDate', width: 220 },
    { title: 'Görüntülenme', dataIndex: 'viewCount', key: 'viewCount', sorter: (a, b) => a.viewCount - b.viewCount, width: 120 },
    { title: 'Favori', dataIndex: 'favoritesCount', key: 'favoritesCount', sorter: (a, b) => a.favoritesCount - b.favoritesCount, width: 90 },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 170,
      fixed: 'right',
      render: (_value, r) => {
        const items = [
          { key: 'featured', label: 'Öne çıkar', onClick: () => togglePremium(r.id, 'featured') },
          { key: 'vitrin', label: 'Vitrine al', onClick: () => togglePremium(r.id, 'vitrin') },
          { key: 'remove', label: 'Premium kaldır', onClick: () => togglePremium(r.id, 'none') },
        ];

        return (
          <Dropdown trigger={['click']} menu={{ items }}>
            <Button size="small">İşlemler</Button>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Typography.Title level={3} style={{ margin: 0 }}>Vitrin / Premium</Typography.Title>
        <Table
          columns={columns}
          dataSource={data}
          rowKey={(r) => String(r.id)}
          pagination={{ pageSize: 25, showTotal: (total) => `Toplam ${total} kayıt` }}
          size="middle"
          sticky
          scroll={{ x: 1300 }}
        />
      </Space>
    </div>
  );
};

export default Vitrin;

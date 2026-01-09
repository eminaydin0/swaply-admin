import React, { useMemo, useState } from 'react';
import { Button, Drawer, Dropdown, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMockStore } from '../stores/mockStore';
import type { SwapOffer } from '../types/models';
import type { Product, User } from '../types/models';

const Offers: React.FC = () => {
  const db = useMockStore((s) => s.db);
  const forceCancel = useMockStore((s) => s.forceCancelOffer);
  const forceReject = useMockStore((s) => s.forceRejectOffer);
  const forceAccept = useMockStore((s) => s.forceAcceptOffer);

  const [selected, setSelected] = useState<SwapOffer | null>(null);

  type OfferRow = SwapOffer & {
    key: string;
    initiator?: User;
    targetUser?: User;
    targetProduct?: Product;
    offeredProduct?: Product;
  };

  const data = useMemo((): OfferRow[] => {
    return db.offers.map((o) => {
      const initiator = db.users.find((u) => String(u.id) === String(o.initiatorId));
      const targetUser = db.users.find((u) => String(u.id) === String(o.targetUserId));
      const targetProduct = db.products.find((p) => String(p.id) === String(o.targetProductId));
      const offeredProduct = db.products.find((p) => String(p.id) === String(o.offeredProductId));
      return {
        ...o,
        key: String(o.id),
        initiator,
        targetUser,
        targetProduct,
        offeredProduct,
      };
    });
  }, [db.offers, db.users, db.products]);

  const columns: ColumnsType<OfferRow> = [
    { title: 'Teklif ID', dataIndex: 'id', key: 'id', width: 110 },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      filters: [
        { text: 'bekliyor', value: 'pending' },
        { text: 'kabul', value: 'accepted' },
        { text: 'red', value: 'rejected' },
        { text: 'iptal', value: 'cancelled' },
        { text: 'tamamlandı', value: 'completed' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (s: string) => {
        const color =
          s === 'pending' ? 'gold' : s === 'accepted' ? 'green' : s === 'rejected' ? 'red' : s === 'cancelled' ? 'default' : 'blue';
        const label =
          s === 'pending'
            ? 'BEKLİYOR'
            : s === 'accepted'
              ? 'KABUL'
              : s === 'rejected'
                ? 'RED'
                : s === 'cancelled'
                  ? 'İPTAL'
                  : 'TAMAMLANDI';
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: 'Teklif Veren',
      key: 'initiator',
      width: 220,
      render: (_value, r) => (
        <Space direction="vertical" size={0}>
          <span>{r.initiator?.fullName ?? '—'}</span>
          <Typography.Text type="secondary">{r.initiator?.username ?? ''}</Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Teklif Alan',
      key: 'target',
      width: 220,
      render: (_value, r) => (
        <Space direction="vertical" size={0}>
          <span>{r.targetUser?.fullName ?? '—'}</span>
          <Typography.Text type="secondary">{r.targetUser?.username ?? ''}</Typography.Text>
        </Space>
      ),
    },
    { title: 'İstenen Ürün', dataIndex: ['targetProduct', 'name'], key: 'targetProduct', width: 240, ellipsis: true },
    { title: 'Teklif Edilen Ürün', dataIndex: ['offeredProduct', 'name'], key: 'offeredProduct', width: 240, ellipsis: true },
    { title: 'Oluşturma', dataIndex: 'createdAt', key: 'createdAt', width: 200 },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 170,
      fixed: 'right',
      render: (_value, r) => {
        const items = [
          {
            key: 'forceAccept',
            label: 'Zorla kabul et',
            disabled: r.status !== 'pending',
            onClick: () => forceAccept(r.id),
          },
          {
            key: 'forceReject',
            label: 'Zorla reddet',
            onClick: () => forceReject(r.id),
          },
          {
            key: 'forceCancel',
            label: 'İptal et',
            onClick: () => forceCancel(r.id),
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
        <Typography.Title level={3} style={{ margin: 0 }}>Teklifler</Typography.Title>
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
        title={`Teklif #${selected?.id ?? ''}`}
        open={!!selected}
        onClose={() => setSelected(null)}
        width={720}
      >
        {selected && (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Space wrap>
              <Tag>Durum: {selected.status.toUpperCase()}</Tag>
              <Tag>Teklif veren: {String(selected.initiatorId)}</Tag>
              <Tag>Teklif alan: {String(selected.targetUserId)}</Tag>
            </Space>
            <Typography.Paragraph>{selected.message}</Typography.Paragraph>
            <Typography.Text type="secondary">Oluşturma: {selected.createdAt}</Typography.Text>
          </Space>
        )}
      </Drawer>
    </div>
  );
};

export default Offers;

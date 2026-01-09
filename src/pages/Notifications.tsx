import React, { useMemo } from 'react';
import { Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMockStore } from '../stores/mockStore';
import type { NotificationItem } from '../types/models';

function notificationTypeLabel(t: string) {
  switch (t) {
    case 'swap_offer':
      return 'TAKAS TEKLİFİ';
    case 'swap_accepted':
      return 'TAKAS KABUL';
    case 'swap_rejected':
      return 'TAKAS RED';
    case 'product_viewed':
      return 'ÜRÜN GÖRÜNTÜLENDİ';
    case 'new_message':
      return 'YENİ MESAJ';
    case 'favorite_updated':
      return 'FAVORİ GÜNCELLENDİ';
    default:
      return String(t).toUpperCase();
  }
}

const Notifications: React.FC = () => {
  const notifications = useMockStore((s) => s.db.notifications);

  type NotificationRow = NotificationItem & { key: string };
  const data = useMemo((): NotificationRow[] => notifications.map((n) => ({ ...n, key: String(n.id) })), [notifications]);

  const columns: ColumnsType<NotificationRow> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 120 },
    {
      title: 'Tür',
      dataIndex: 'type',
      key: 'type',
      width: 180,
      filters: [
        { text: 'takas teklifi', value: 'swap_offer' },
        { text: 'takas kabul', value: 'swap_accepted' },
        { text: 'takas red', value: 'swap_rejected' },
        { text: 'ürün görüntülendi', value: 'product_viewed' },
        { text: 'yeni mesaj', value: 'new_message' },
        { text: 'favori güncellendi', value: 'favorite_updated' },
      ],
      onFilter: (value, record) => record.type === value,
      render: (t: string) => <Tag>{notificationTypeLabel(t)}</Tag>,
    },
    { title: 'Başlık', dataIndex: 'title', key: 'title', width: 260, ellipsis: true },
    { title: 'Mesaj', dataIndex: 'message', key: 'message', width: 420, ellipsis: true },
    {
      title: 'Okundu',
      dataIndex: 'isRead',
      key: 'isRead',
      filters: [
        { text: 'okunmadı', value: false },
        { text: 'okundu', value: true },
      ],
      onFilter: (value, record) => record.isRead === value,
      render: (v: boolean) => (v ? <Tag color="green">OKUNDU</Tag> : <Tag color="gold">OKUNMADI</Tag>),
      width: 100,
    },
    { title: 'Zaman', dataIndex: 'time', key: 'time', width: 200 },
    { title: 'Kullanıcı', dataIndex: 'userId', key: 'userId', width: 90 },
    { title: 'Ürün', dataIndex: 'productId', key: 'productId', width: 90 },
  ];

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Typography.Title level={3} style={{ margin: 0 }}>Bildirimler</Typography.Title>
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
          scroll={{ x: 1500 }}
        />
      </Space>
    </div>
  );
};

export default Notifications;

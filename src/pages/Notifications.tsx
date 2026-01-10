import React, { useMemo, useState } from 'react';
import { Avatar, Input, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { useMockStore } from '../stores/mockStore';
import type { NotificationItem, User } from '../types/models';

const { Text } = Typography;

function notificationTypeLabel(t: string) {
  switch (t) {
    case 'swap_offer':
      return { label: 'TAKAS TEKLİFİ', color: 'blue' };
    case 'swap_accepted':
      return { label: 'TAKAS KABUL', color: 'green' };
    case 'swap_rejected':
      return { label: 'TAKAS RED', color: 'red' };
    case 'product_viewed':
      return { label: 'ÜRÜN GÖRÜNTÜLENDİ', color: 'purple' };
    case 'new_message':
      return { label: 'YENİ MESAJ', color: 'gold' };
    case 'favorite_updated':
      return { label: 'FAVORİ', color: 'magenta' };
    case 'system_alert':
      return { label: 'SİSTEM', color: 'volcano' };
    default:
      return { label: String(t).toUpperCase(), color: 'default' };
  }
}

function formatRelativeTime(value: string) {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    const diff = (new Date().getTime() - d.getTime()) / 1000;
    
    if (diff < 60) return 'Az önce';
    if (diff < 3600) return `${Math.floor(diff / 60)} dakika önce`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`;
    return d.toLocaleDateString('tr-TR');
}

const Notifications: React.FC = () => {
  const notifications = useMockStore((s) => s.db.notifications);
  const users = useMockStore((s) => s.db.users);

  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState<TablePaginationConfig>({
      current: 1,
      pageSize: 25,
      showSizeChanger: true,
      showTotal: (total) => `Toplam ${total} kayıt`,
  });

  type NotificationRow = NotificationItem & { 
      key: string;
      user?: User; 
  };

  const data = useMemo((): NotificationRow[] => {
    const normalizedSearch = search.trim().toLowerCase();

    return notifications.map((n) => {
        const user = users.find(u => String(u.id) === String(n.userId));
        return { 
            ...n, 
            key: String(n.id),
            user
        };
    }).filter(n => {
        if (!normalizedSearch) return true;
        const inTitle = n.title.toLowerCase().includes(normalizedSearch);
        const inMsg = n.message.toLowerCase().includes(normalizedSearch);
        const inUser = n.user ? (n.user.fullName.toLowerCase().includes(normalizedSearch) || n.user.username.toLowerCase().includes(normalizedSearch)) : false;
        return inTitle || inMsg || inUser;
    });
  }, [notifications, users, search]);

  const columns: ColumnsType<NotificationRow> = [
    {
       title: 'Kullanıcı',
       key: 'user',
       width: 220,
       render: (_v, r) => {
           if (!r.user) return <Text type="secondary">System / Bilinmiyor</Text>;
           return (
               <Space>
                   <Avatar src={r.user.avatar} />
                   <Space orientation="vertical" size={0}>
                       <Text strong>{r.user.fullName}</Text>
                       <Text type="secondary" style={{fontSize: 12}}>@{r.user.username}</Text>
                   </Space>
               </Space>
           )
       }
    },
    {
      title: 'Bildirim',
      key: 'content',
      width: 400,
      render: (_v, r) => {
          const typeInfo = notificationTypeLabel(r.type);
          return (
              <Space orientation="vertical" size={4} style={{width: '100%'}}>
                  <Space>
                      <Tag color={typeInfo.color} style={{ margin: 0, fontSize: 10 }}>{typeInfo.label}</Tag>
                      <Text strong style={{ fontSize: 13 }}>{r.title}</Text>
                  </Space>
                  <Text type="secondary" ellipsis={{tooltip: r.message}} style={{ fontSize: 13 }}>
                      {r.message}
                  </Text>
              </Space>
          )
      }
    },
    {
      title: 'Hedef',
      key: 'target',
      width: 120,
      render: (_v, r) => {
          if (r.productId) return <Tag>Ürün #{r.productId}</Tag>;
          return <Text type="secondary">—</Text>;
      }
    },
    {
      title: 'Durum',
      dataIndex: 'isRead',
      key: 'isRead',
      width: 120,
      filters: [
        { text: 'okunmadı', value: false },
        { text: 'okundu', value: true },
      ],
      onFilter: (value, record) => record.isRead === value,
      render: (v: boolean) => (v ? <Tag color="default" variant="filled">OKUNDU</Tag> : <Tag color="gold">OKUNMADI</Tag>),
    },
    { 
        title: 'Zaman', 
        dataIndex: 'time', 
        key: 'time', 
        width: 150,
        render: (t: string) => <Text type="secondary">{formatRelativeTime(t)}</Text>,
        sorter: (a, b) => new Date(b.time || '').getTime() - new Date(a.time || '').getTime(),
    },
  ];

  return (
    <div>
      <Space orientation="vertical" style={{ width: '100%' }} size="large">
        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
          <Typography.Title level={3} style={{ margin: 0 }}>Bildirimler</Typography.Title>
          <Input.Search
            placeholder="Ara: başlık / mesaj / kullanıcı"
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
          scroll={{ x: 1000 }}
        />
      </Space>
    </div>
  );
};

export default Notifications;

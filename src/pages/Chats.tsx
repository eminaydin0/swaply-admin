import React, { useMemo } from 'react';
import { Button, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { useMockStore } from '../stores/mockStore';
import type { ChatThread } from '../types/models';

const Chats: React.FC = () => {
  const threads = useMockStore((s) => s.db.threads);
  const navigate = useNavigate();

  const data = useMemo(() => {
    return threads.map((t) => ({ ...t, key: String(t.id) }));
  }, [threads]);

  type ChatRow = ChatThread & { key: string };

  const columns: ColumnsType<ChatRow> = [
    { title: 'Sohbet ID', dataIndex: 'id', key: 'id', width: 120 },
    {
      title: 'Karşı Taraf',
      key: 'other',
      render: (_value, r) => (
        <Space direction="vertical" size={0}>
          <span>{r.otherName}</span>
          <Typography.Text type="secondary">{r.otherUsername}</Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Çevrimiçi',
      dataIndex: 'isOnline',
      key: 'isOnline',
      width: 90,
      render: (v: boolean) => (v ? <Tag color="green">AÇIK</Tag> : <Tag>KAPALI</Tag>),
    },
    {
      title: 'Ürün Bağlamı',
      key: 'product',
      render: (_value, r) =>
        r.productName ? (
          <span>{r.productName}</span>
        ) : (
          <Typography.Text type="secondary">—</Typography.Text>
        ),
      ellipsis: true,
    },
    { title: 'Son Mesaj', dataIndex: 'lastMessageText', key: 'lastMessageText', ellipsis: true },
    { title: 'Son Aktivite', dataIndex: 'lastMessageTime', key: 'lastMessageTime', width: 200 },
    { title: 'Okunmamış', dataIndex: 'unreadCount', key: 'unreadCount', width: 110, sorter: (a, b) => a.unreadCount - b.unreadCount },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 120,
      render: (_value, r) => (
        <Button size="small" onClick={() => navigate(`/chats/${encodeURIComponent(String(r.id))}`)}>
          Görüntüle
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Typography.Title level={3} style={{ margin: 0 }}>
          Sohbetler
        </Typography.Title>
        <Table columns={columns} dataSource={data} rowKey={(r) => String(r.id)} pagination={{ pageSize: 25 }} scroll={{ x: 1100 }} />
      </Space>
    </div>
  );
};

export default Chats;

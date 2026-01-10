import React, { useMemo, useState } from 'react';
import { Button, Drawer, Input, List, Space, Table, Tag, Typography, Avatar, Image, Badge } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { useMockStore } from '../stores/mockStore';
import type { ChatThread } from '../types/models';

const { Text } = Typography;

function formatRelativeTime(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const diff = (new Date().getTime() - d.getTime()) / 1000;
  
  if (diff < 60) return 'Az önce';
  if (diff < 3600) return `${Math.floor(diff / 60)} dakika önce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`;
  return d.toLocaleDateString('tr-TR');
}

const Chats: React.FC = () => {
  const db = useMockStore((s) => s.db);
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ChatThread | null>(null);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
      current: 1,
      pageSize: 25,
      showSizeChanger: true,
      showTotal: (total) => `Toplam ${total} kayıt`,
  });

  type ChatRow = ChatThread & { key: string };

  const data = useMemo((): ChatRow[] => {
    const normalizedSearch = search.trim().toLowerCase();
    
    return db.threads.map((t) => ({ ...t, key: String(t.id) }))
      .filter(t => {
          if (!normalizedSearch) return true;
          const inName = t.otherName.toLowerCase().includes(normalizedSearch);
          const inUser = t.otherUsername.toLowerCase().includes(normalizedSearch);
          const inProd = t.productName ? t.productName.toLowerCase().includes(normalizedSearch) : false;
          const inMsg = t.lastMessageText.toLowerCase().includes(normalizedSearch);
          return inName || inUser || inProd || inMsg;
      });
  }, [db.threads, search]);

  const selectedMessages = useMemo(() => {
     if(!selected) return [];
     return db.messages
        .filter(m => String(m.threadId) === String(selected.id))
        .sort((a,b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 5); // Show last 5 messages in quick view
  }, [db.messages, selected]);

  const columns: ColumnsType<ChatRow> = [
    {
      title: 'Kullanıcı',
      key: 'user',
      width: 250,
      render: (_value, r) => (
        <Space>
           <Badge dot={r.isOnline} color="green" offset={[-6, 26]}>
              <Avatar src={r.otherAvatar} size={40} />
           </Badge>
           <Space direction="vertical" size={0}>
              <Text strong>{r.otherName}</Text>
              <Text type="secondary" style={{fontSize: 12}}>@{r.otherUsername}</Text>
           </Space>
        </Space>
      ),
      sorter: (a, b) => a.otherName.localeCompare(b.otherName),
    },
    {
      title: 'İlgili Ürün',
      key: 'product',
      width: 200,
      render: (_value, r) => {
        if (!r.productName) return <Text type="secondary" style={{fontSize:12}}>—</Text>;
        return (
            <Space>
                {r.productImage ? 
                   <Image width={32} height={32} src={r.productImage} style={{borderRadius: 4, objectFit:'cover'}} /> :
                   <div style={{width: 32, height: 32, background:'#eee', borderRadius:4}} />
                }
                <Text ellipsis style={{maxWidth: 140, fontSize: 13}}>{r.productName}</Text>
            </Space>
        );
      }
    },
    { 
        title: 'Son Mesaj', 
        key: 'lastMessage', 
        width: 300,
        render: (_v, r) => (
            <Space direction="vertical" size={2} style={{width:'100%'}}>
                 <Text ellipsis style={{maxWidth: 280, color: r.unreadCount > 0 ? '#000' : '#666', fontWeight: r.unreadCount > 0 ? 600 : 400}}>
                     {r.lastMessageText}
                 </Text>
                 <Text type="secondary" style={{fontSize: 11}}>{formatRelativeTime(r.lastMessageTime)}</Text>
            </Space>
        )
    },
    { 
        title: 'Durum', 
        dataIndex: 'unreadCount', 
        key: 'unreadCount', 
        width: 100, 
        sorter: (a, b) => a.unreadCount - b.unreadCount,
        render: (c: number) => c > 0 ? <Tag color="red">{c} YENİ</Tag> : <Tag color="default" bordered={false}>OKUNDU</Tag>
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_value, r) => (
        <Space>
            <Button size="small" type="primary" ghost onClick={() => navigate(`/chats/${encodeURIComponent(String(r.id))}`)}>
            Sohbete Git
            </Button>
            <Button size="small" onClick={() => setSelected(r)}>Önizle</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
            <Typography.Title level={3} style={{ margin: 0 }}>Sohbetler</Typography.Title>
            <Input.Search
                placeholder="Ara: kullanıcı / mesaj / ürün"
                allowClear
                style={{ maxWidth: 420 }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </Space>

        <Table columns={columns} dataSource={data} rowKey={(r) => String(r.id)} pagination={pagination} onChange={p => setPagination(p)} scroll={{ x: 1000 }} sticky size="middle" />
      </Space>

      <Drawer
        title="Sohbet Önizleme"
        open={!!selected}
        onClose={() => setSelected(null)}
        width={500}
      >
        {selected && (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Space align="start">
                    <Avatar size={64} src={selected.otherAvatar} />
                    <div>
                        <Typography.Title level={4} style={{marginTop:0, marginBottom:4}}>{selected.otherName}</Typography.Title>
                        <Text type="secondary">@{selected.otherUsername}</Text>
                        <div style={{marginTop:4}}>
                            {selected.isOnline ? <Tag color="green">ÇEVRİMİÇİ</Tag> : <Tag>ÇEVRİMDIŞI</Tag>}
                        </div>
                    </div>
                </Space>

                {selected.productName && (
                    <div style={{background:'#f9f9f9', padding: 12, borderRadius: 8, display:'flex', gap: 12, alignItems:'center'}}>
                         {selected.productImage && <Image width={48} height={48} src={selected.productImage} style={{borderRadius: 6}} />}
                         <div>
                             <Text type="secondary" style={{fontSize:12}}>İLGİLİ ÜRÜN</Text>
                             <div style={{fontWeight:600}}>{selected.productName}</div>
                         </div>
                    </div>
                )}

                <div>
                    <Typography.Title level={5}>Son Mesajlar</Typography.Title>
                    <List
                        dataSource={selectedMessages}
                        renderItem={item => (
                            <List.Item>
                                <List.Item.Meta
                                    title={<div style={{display:'flex', justifyContent:'space-between'}}>
                                        <Text style={{fontSize:12, fontWeight: item.senderUserId === selected.otherUserId ? 600 : 400}}>
                                            {item.senderUserId === selected.otherUserId ? selected.otherName : 'Siz'}
                                        </Text>
                                        <Text type="secondary" style={{fontSize:10}}>{formatRelativeTime(item.time)}</Text>
                                    </div>}
                                    description={<Text>{item.text}</Text>}
                                />
                            </List.Item>
                        )}
                        locale={{emptyText: 'Mesaj yok'}}
                    />
                </div>
                
                <Button type="primary" block size="large" onClick={() => navigate(`/chats/${encodeURIComponent(String(selected.id))}`)}>
                    Tüm Sohbeti Görüntüle
                </Button>
            </Space>
        )}
      </Drawer>
    </div>
  );
};

export default Chats;

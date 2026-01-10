import React, { useMemo } from 'react';
import { Card, Image, List, Space, Tag, Typography, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useMockStore } from '../stores/mockStore';

const ChatThreadPage: React.FC = () => {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const db = useMockStore((s) => s.db);

  const thread = useMemo(() => db.threads.find((t) => String(t.id) === String(threadId)), [db.threads, threadId]);
  const messages = useMemo(
    () => db.messages.filter((m) => String(m.threadId) === String(threadId)).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()),
    [db.messages, threadId],
  );

  const statusLabel = (s: string) => (s === 'sent' ? 'GÖNDERİLDİ' : s === 'delivered' ? 'İLETİLDİ' : 'OKUNDU');

  if (!thread) {
    return <Typography.Text type="secondary">Sohbet bulunamadı.</Typography.Text>;
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/chats')} 
            shape="circle"
            size="large"
            title="Sohbetlere Dön"
            style={{ marginTop: 4 }}
        />
        <Space direction="vertical" size={0}>
          <Typography.Title level={3} style={{ margin: 0 }}>Sohbet {String(thread.id)}</Typography.Title>
          <Typography.Text type="secondary">{thread.otherName} • {thread.otherUsername}</Typography.Text>
        </Space>
      </div>

      {thread.productName && (
        <Card size="small" title="Ürün Bağlamı">
          <Space>
            {thread.productImage && <Image width={64} height={48} src={thread.productImage} />}
            <Typography.Text>{thread.productName}</Typography.Text>
          </Space>
        </Card>
      )}

      <Card title="Mesajlar" bodyStyle={{ padding: 0 }}>
        <List
          dataSource={messages}
          renderItem={(m) => (
            <List.Item>
              <List.Item.Meta
                title={
                  <Space wrap>
                    <Tag>{String(m.senderUserId)}</Tag>
                    <Typography.Text type="secondary">{m.time}</Typography.Text>
                    <Tag color={m.status === 'read' ? 'green' : m.status === 'delivered' ? 'blue' : 'default'}>{statusLabel(m.status)}</Tag>
                  </Space>
                }
                description={
                  <Space direction="vertical" size={8} style={{ width: '100%' }}>
                    <Typography.Text>{m.text}</Typography.Text>
                    {!!m.images?.length && (
                      <Space wrap>
                        {m.images.map((url) => (
                          <Image key={url} width={96} height={72} src={url} />
                        ))}
                      </Space>
                    )}
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </Space>
  );
};

export default ChatThreadPage;

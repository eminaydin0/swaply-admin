import React, { useMemo } from 'react';
import { Button, Card, Descriptions, Space, Tabs, Tag, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useMockStore } from '../stores/mockStore';

const UserDetail: React.FC = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const db = useMockStore((s) => s.db);

  const user = useMemo(() => db.users.find((u) => String(u.id) === String(userId)), [db.users, userId]);

  const ownedProducts = useMemo(
    () => db.products.filter((p) => String(p.ownerId) === String(userId)),
    [db.products, userId],
  );

  const offers = useMemo(
    () => db.offers.filter((o) => String(o.initiatorId) === String(userId) || String(o.targetUserId) === String(userId)),
    [db.offers, userId],
  );

  const notifications = useMemo(
    () => db.notifications.filter((n) => String(n.userId) === String(userId)),
    [db.notifications, userId],
  );

  const notificationSettings = db.notificationSettingsByUserId[String(userId ?? '')];
  const locationSettings = db.locationSettingsByUserId[String(userId ?? '')];
  const trust = db.trustScoresByUserId[String(userId ?? '')];

  if (!user) {
    return <Typography.Text type="secondary">Kullanıcı bulunamadı.</Typography.Text>;
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/users')} 
            shape="circle"
            size="large"
            title="Listeye Dön"
            style={{ marginTop: 4 }}
        />
        <Space direction="vertical" size={0}>
            <Typography.Title level={3} style={{ margin: 0 }}>{user.fullName}</Typography.Title>
            <Typography.Text type="secondary">{user.username} • {user.email}</Typography.Text>
        </Space>
      </div>

      <Tabs
        items={[
          {
            key: 'profile',
            label: 'Profil',
            children: (
              <Card>
                <Descriptions column={2} bordered size="small">
                  <Descriptions.Item label="Rol">{user.role}</Descriptions.Item>
                  <Descriptions.Item label="Doğrulandı">{user.verified ? <Tag color="green">EVET</Tag> : <Tag>HAYIR</Tag>}</Descriptions.Item>
                  <Descriptions.Item label="Çevrimiçi">{user.onlineStatus ? <Tag color="green">AÇIK</Tag> : <Tag>KAPALI</Tag>}</Descriptions.Item>
                  <Descriptions.Item label="Premium">{user.isPremium ? <Tag color="purple">EVET</Tag> : <Tag>HAYIR</Tag>}</Descriptions.Item>
                  <Descriptions.Item label="Konum">{user.location}</Descriptions.Item>
                  <Descriptions.Item label="Kayıt Tarihi">{user.joinDate}</Descriptions.Item>
                  <Descriptions.Item label="Son Aktif">{user.lastActive}</Descriptions.Item>
                  <Descriptions.Item label="Puan">{user.rating}</Descriptions.Item>
                  <Descriptions.Item label="Yanıt Oranı">{user.responseRate}%</Descriptions.Item>
                  <Descriptions.Item label="Takipçi">{user.followersCount}</Descriptions.Item>
                  <Descriptions.Item label="Takip">{user.followingCount}</Descriptions.Item>
                  <Descriptions.Item label="Favori">{user.favoritesProductIds.length}</Descriptions.Item>
                </Descriptions>
              </Card>
            ),
          },
          {
            key: 'listings',
            label: `İlanlar (${ownedProducts.length})`,
            children: (
              <Card>
                <ul style={{ marginTop: 0 }}>
                  {ownedProducts.slice(0, 50).map((p) => (
                    <li key={String(p.id)}>{p.name}</li>
                  ))}
                </ul>
              </Card>
            ),
          },
          {
            key: 'offers',
            label: `Teklifler (${offers.length})`,
            children: (
              <Card>
                <ul style={{ marginTop: 0 }}>
                  {offers.slice(0, 50).map((o) => (
                    <li key={String(o.id)}>
                      #{o.id} • {o.status} • targetProduct {String(o.targetProductId)} • offeredProduct {String(o.offeredProductId)}
                    </li>
                  ))}
                </ul>
              </Card>
            ),
          },
          {
            key: 'favorites',
            label: `Favoriler (${user.favoritesProductIds.length})`,
            children: (
              <Card>
                <ul style={{ marginTop: 0 }}>
                  {user.favoritesProductIds.slice(0, 80).map((pid) => (
                    <li key={String(pid)}>{String(pid)}</li>
                  ))}
                </ul>
              </Card>
            ),
          },
          {
            key: 'notificationSettings',
            label: 'Bildirim Ayarları',
            children: (
              <Card>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(notificationSettings, null, 2)}</pre>
              </Card>
            ),
          },
          {
            key: 'locationSettings',
            label: 'Konum Ayarları',
            children: (
              <Card>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(locationSettings, null, 2)}</pre>
              </Card>
            ),
          },
          {
            key: 'trust',
            label: 'Güven Skoru',
            children: (
              <Card>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(trust, null, 2)}</pre>
              </Card>
            ),
          },
          {
            key: 'notifications',
            label: `Bildirimler (${notifications.length})`,
            children: (
              <Card>
                <ul style={{ marginTop: 0 }}>
                  {notifications.slice(0, 50).map((n) => (
                    <li key={String(n.id)}>
                      {n.type} • {n.title} • {n.isRead ? 'okundu' : 'okunmadı'}
                    </li>
                  ))}
                </ul>
              </Card>
            ),
          },
        ]}
      />
    </Space>
  );
};

export default UserDetail;

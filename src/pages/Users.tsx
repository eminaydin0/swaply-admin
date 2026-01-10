import React, { useMemo, useState } from 'react';
import { Avatar, Button, Dropdown, Input, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { User } from '../types/models';
import { useNavigate } from 'react-router-dom';
import { useMockStore } from '../stores/mockStore';

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('tr-TR');
}

function formatDateTime(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('tr-TR');
}

function roleLabel(role: User['role']) {
  if (role === 'admin') return 'YÖNETİCİ';
  if (role === 'moderator') return 'MODERATÖR';
  return 'KULLANICI';
}

function trustColor(score: number) {
  if (score >= 80) return 'green';
  if (score >= 60) return 'gold';
  if (score >= 40) return 'orange';
  return 'red';
}

const Users: React.FC = () => {
  const db = useMockStore((s) => s.db);
  const toggleVerified = useMockStore((s) => s.toggleUserVerified);
  const banUser = useMockStore((s) => s.banUser);
  const unbanUser = useMockStore((s) => s.unbanUser);
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 25,
    showSizeChanger: true,
    showTotal: (total) => `Toplam ${total} kayıt`,
  });

  type UserRow = User & {
    key: string;
    favoritesCount: number;
    listingsCount: number;
    completedSwapsCount: number;
    trustScore: number;
  };

  const rows = useMemo((): UserRow[] => {
    const productsByOwner = new Map<string, number>();
    const exchangedByOwner = new Map<string, number>();
    for (const p of db.products) {
      const k = String(p.ownerId);
      productsByOwner.set(k, (productsByOwner.get(k) ?? 0) + 1);
      if (p.isExchanged) exchangedByOwner.set(k, (exchangedByOwner.get(k) ?? 0) + 1);
    }

    const normalizedSearch = search.trim().toLowerCase();
    return db.users
      .map((u) => {
        const trust = db.trustScoresByUserId[String(u.id)];
        return {
          ...u,
          key: String(u.id),
          favoritesCount: u.favoritesProductIds.length,
          listingsCount: productsByOwner.get(String(u.id)) ?? 0,
          completedSwapsCount: exchangedByOwner.get(String(u.id)) ?? 0,
          trustScore: trust?.overallScore ?? 0,
        };
      })
      .filter((u) => {
        if (!normalizedSearch) return true;
        return (
          u.fullName.toLowerCase().includes(normalizedSearch) ||
          u.username.toLowerCase().includes(normalizedSearch) ||
          u.email.toLowerCase().includes(normalizedSearch)
        );
      });
  }, [db.users, db.products, db.trustScoresByUserId, search]);

  const columns: ColumnsType<UserRow> = [
    {
      title: 'Kullanıcı',
      key: 'user',
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
      width: 360,
      ellipsis: true,
      render: (_value, r) => (
        <Space size={12}>
          <Avatar src={r.avatar} size={36} />
          <Space direction="vertical" size={0}>
            <Typography.Text ellipsis>{r.fullName}</Typography.Text>
            <Typography.Text type="secondary" ellipsis>@{r.username}</Typography.Text>
            <Typography.Text type="secondary" ellipsis>{r.email}</Typography.Text>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Rol',
      dataIndex: 'role',
      key: 'role',
      filters: [
        { text: 'kullanıcı', value: 'user' },
        { text: 'moderatör', value: 'moderator' },
        { text: 'yönetici', value: 'admin' },
      ],
      onFilter: (value, record) => record.role === value,
      render: (role: User['role']) => <Tag color={role === 'admin' ? 'purple' : role === 'moderator' ? 'geekblue' : 'default'}>{roleLabel(role)}</Tag>,
      width: 130,
    },
    {
      title: 'Durum',
      key: 'status',
      width: 250,
      render: (_value, r) => (
        <Space wrap size={[4, 4]}>
          {r.verified ? <Tag color="green">DOĞRULANDI</Tag> : <Tag>DOĞRULANMADI</Tag>}
          {r.isPremium ? <Tag color="purple">PREMIUM</Tag> : <Tag>NORMAL</Tag>}
          {r.onlineStatus ? <Tag color="green">ÇEVRİMİÇİ</Tag> : <Tag>ÇEVRİMDIŞI</Tag>}
        </Space>
      ),
    },
    { title: 'İlan', dataIndex: 'listingsCount', key: 'listingsCount', width: 90, sorter: (a, b) => a.listingsCount - b.listingsCount },
    { title: 'Takas', dataIndex: 'completedSwapsCount', key: 'completedSwapsCount', width: 90, sorter: (a, b) => a.completedSwapsCount - b.completedSwapsCount },
    {
      title: 'Güven',
      dataIndex: 'trustScore',
      key: 'trustScore',
      width: 110,
      sorter: (a, b) => a.trustScore - b.trustScore,
      render: (v: number) => <Tag color={trustColor(v)}>{v}</Tag>,
    },
    {
      title: 'Kayıt',
      dataIndex: 'joinDate',
      key: 'joinDate',
      width: 120,
      render: (v: string) => <Typography.Text type="secondary">{formatDate(v)}</Typography.Text>,
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 140,
      fixed: 'right',
      render: (_value, r) => (
        <Space>
          <Button size="small" onClick={() => navigate(`/users/${encodeURIComponent(String(r.id))}`)}>Detay</Button>
          <Dropdown
            trigger={['click']}
            menu={{
              items: [
                {
                  key: 'verify',
                  label: r.verified ? 'Doğrulamayı kaldır' : 'Doğrula',
                  onClick: () => toggleVerified(r.id),
                },
                { key: 'ban', label: 'Çevrimdışı yap (Mock)', onClick: () => banUser(r.id) },
                { key: 'unban', label: 'Çevrimiçi yap (Mock)', onClick: () => unbanUser(r.id) },
              ],
            }}
          >
            <Button size="small">Diğer</Button>
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
          <Typography.Title level={3} style={{ margin: 0 }}>Kullanıcılar</Typography.Title>
          <Input.Search
            placeholder="Ara: ad / @kullanıcı / e-posta"
            allowClear
            style={{ maxWidth: 420 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Space>

        <Table
          columns={columns}
          dataSource={rows}
          rowKey={(r) => String(r.id)}
          pagination={pagination}
          onChange={(p) => setPagination(p)}
          expandable={{
            expandedRowRender: (r) => (
              <Space direction="vertical" size={4} style={{ width: '100%' }}>
                <Typography.Text type="secondary">
                  E-posta: {r.email} · Telefon: {r.phone} · Konum: {r.location}
                </Typography.Text>
                <Typography.Text type="secondary">
                  Son aktif: {formatDateTime(r.lastActive)} · Favori: {r.favoritesCount} · Takipçi: {r.followersCount} · Takip: {r.followingCount}
                </Typography.Text>
              </Space>
            ),
            rowExpandable: () => true,
          }}
          size="middle"
          sticky
          scroll={{ x: 1100 }}
        />
      </Space>
    </div>
  );
};

export default Users;

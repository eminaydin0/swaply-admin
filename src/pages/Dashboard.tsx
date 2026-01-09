import React, { useMemo } from 'react';
import { Card, Col, Row, Statistic, Typography } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import dayjs from 'dayjs';
import { useMockStore } from '../stores/mockStore';
import { computeKpis } from '../utils/kpis';

const Dashboard: React.FC = () => {
  const db = useMockStore((s) => s.db);

  const kpis = useMemo(() => {
    return computeKpis({
      products: db.products,
      offers: db.offers,
      threads: db.threads,
      notifications: db.notifications,
      nowIso: new Date().toISOString(),
    });
  }, [db.products, db.offers, db.threads, db.notifications]);

  const newUsersPerDay = useMemo(() => {
    const days = Array.from({ length: 30 }).map((_, i) => dayjs().subtract(29 - i, 'day').format('YYYY-MM-DD'));
    const counts: Record<string, number> = Object.fromEntries(days.map((d) => [d, 0]));
    for (const u of db.users) {
      const d = dayjs(u.joinDate).format('YYYY-MM-DD');
      if (counts[d] !== undefined) counts[d] += 1;
    }
    return days.map((d) => ({ date: d.slice(5), count: counts[d] ?? 0 }));
  }, [db.users]);

  const listingsPerDay = useMemo(() => {
    const days = Array.from({ length: 30 }).map((_, i) => dayjs().subtract(29 - i, 'day').format('YYYY-MM-DD'));
    const counts: Record<string, number> = Object.fromEntries(days.map((d) => [d, 0]));
    for (const p of db.products) {
      const d = dayjs(p.createdAt).format('YYYY-MM-DD');
      if (counts[d] !== undefined) counts[d] += 1;
    }
    return days.map((d) => ({ date: d.slice(5), count: counts[d] ?? 0 }));
  }, [db.products]);

  const categoryDistribution = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of db.products) {
      map.set(p.categoryName, (map.get(p.categoryName) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [db.products]);

  const topViewed = useMemo(() => {
    return [...db.products]
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 10)
      .map((p) => ({ name: p.name.length > 18 ? `${p.name.slice(0, 18)}…` : p.name, views: p.viewCount }));
  }, [db.products]);

  const COLORS = ['#00aae4', '#5E35B1', '#4CAF50', '#F44336', '#8884d8', '#82ca9d', '#cf1322', '#ff85c0'];

  return (
    <div>
      <Typography.Title level={3} style={{ marginBottom: 16 }}>
        Gösterge Paneli
      </Typography.Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="Toplam Kullanıcı" value={db.users.length} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="Aktif İlan" value={kpis.activeListings} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="Taslak İlan" value={kpis.draftListings} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="Takaslanan İlan" value={kpis.exchangedListings} />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="Bekleyen Teklif" value={kpis.pendingOffers} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="Aktif Sohbet (7g)" value={kpis.activeChats} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="Okunmamış Bildirim" value={kpis.unreadNotifications} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="Premium İlan" value={kpis.premiumListings} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Yeni Kullanıcı / Gün (30g)" bordered={false}>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <LineChart data={newUsersPerDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#00aae4" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Yeni İlan / Gün (30g)" bordered={false}>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <LineChart data={listingsPerDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#5E35B1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Kategori Dağılımı" bordered={false}>
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Tooltip />
                  <Pie data={categoryDistribution} dataKey="value" nameKey="name" outerRadius={110} label>
                    {categoryDistribution.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Görüntülenmeye Göre Top 10 Ürün" bordered={false}>
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer>
                <BarChart data={topViewed} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={120} />
                  <Tooltip />
                  <Bar dataKey="views" fill="#00aae4" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;

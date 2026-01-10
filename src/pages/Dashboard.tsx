import React, { useMemo } from 'react';
import { Card, Col, Row, Statistic, Typography, Space, Avatar, Divider, Tag } from 'antd';
import { 
  UserOutlined, 
  ShoppingOutlined, 
  SwapOutlined, 
  MessageOutlined, 
  BellOutlined,
  CrownOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ArrowUpOutlined
} from '@ant-design/icons';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend 
} from 'recharts';
import dayjs from 'dayjs';
import { useMockStore } from '../stores/mockStore';
import { computeKpis } from '../utils/kpis';

const { Title, Text } = Typography;

const StatCard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  suffix?: string;
  trend?: string;
}> = ({ title, value, icon, color, suffix, trend }) => (
  <Card bordered={false} style={{ height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 8 }}>
    <Space orientation="vertical" style={{ width: '100%' }} size={4}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>{title}</Text>
        <Avatar shape="square" size="small" icon={icon} style={{ backgroundColor: `${color}15`, color: color }} />
      </div>
      
      <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 4 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 600 }}>
            {value}
        </Title>
        {suffix && <Text type="secondary" style={{ marginLeft: 4, fontSize: 14 }}>{suffix}</Text>}
      </div>

      {trend && (
          <div style={{ marginTop: 8 }}>
            <Tag color="green" style={{ margin: 0, border: 'none', background: '#f6ffed' }}>
               <ArrowUpOutlined /> {trend}
            </Tag>
             <Text type="secondary" style={{ fontSize: 12, marginLeft: 6 }}>geçen aya göre</Text>
          </div>
      )}
    </Space>
  </Card>
);

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
    // Generate last 14 days for cleaner look
    const days = Array.from({ length: 14 }).map((_, i) => dayjs().subtract(13 - i, 'day').format('YYYY-MM-DD'));
    const counts: Record<string, number> = Object.fromEntries(days.map((d) => [d, 0]));
    for (const u of db.users) {
      const d = dayjs(u.joinDate).format('YYYY-MM-DD');
      if (counts[d] !== undefined) counts[d] += 1;
    }
    return days.map((d) => ({ date: dayjs(d).format('DD MMM'), count: counts[d] ?? 0 }));
  }, [db.users]);

  const listingsPerDay = useMemo(() => {
    const days = Array.from({ length: 14 }).map((_, i) => dayjs().subtract(13 - i, 'day').format('YYYY-MM-DD'));
    const counts: Record<string, number> = Object.fromEntries(days.map((d) => [d, 0]));
    for (const p of db.products) {
      const d = dayjs(p.createdAt).format('YYYY-MM-DD');
      if (counts[d] !== undefined) counts[d] += 1;
    }
    return days.map((d) => ({ date: dayjs(d).format('DD MMM'), count: counts[d] ?? 0 }));
  }, [db.products]);

  const categoryDistribution = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of db.products) {
      map.set(p.categoryName, (map.get(p.categoryName) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Top 6 categories only
  }, [db.products]);

  const topViewed = useMemo(() => {
    return [...db.products]
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 7)
      .map((p) => ({ 
          name: p.name.length > 20 ? `${p.name.slice(0, 20)}…` : p.name, 
          views: p.viewCount,
          category: p.categoryName
      }));
  }, [db.products]);

  const COLORS = ['#1890ff', '#13c2c2', '#52c41a', '#fadb14', '#fa8c16', '#f5222d', '#722ed1', '#eb2f96'];

  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginTop: 0 }}>Dashboard</Title>
        <Text type="secondary">Sisteme ait anlık veriler ve performans metrikleri</Text>
      </div>

      {/* Top Stats Row */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard 
            title="Toplam Kullanıcı" 
            value={db.users.length} 
            icon={<UserOutlined />} 
            color="#1890ff"
            trend="+12%"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard 
            title="Aktif İlan" 
            value={kpis.activeListings} 
            icon={<ShoppingOutlined />} 
            color="#52c41a"
            trend="+5%"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard 
            title="Bekleyen Teklifler" 
            value={kpis.pendingOffers} 
            icon={<SwapOutlined />} 
            color="#fa8c16"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard 
            title="Aktif Sohbetler (7g)" 
            value={kpis.activeChats} 
            icon={<MessageOutlined />} 
            color="#722ed1"
            trend="+8%"
          />
        </Col>
      </Row>

      {/* Second Row: Detailed Stats grid */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={12} md={6}>
            <Card size="small" bordered={false} hoverable>
                <Statistic 
                    title="Premium İlanlar" 
                    value={kpis.premiumListings} 
                    prefix={<CrownOutlined style={{ color: '#fadb14' }} />} 
                    valueStyle={{ fontSize: 18 }}
                />
            </Card>
        </Col>
        <Col xs={12} md={6}>
            <Card size="small" bordered={false} hoverable>
                <Statistic 
                    title="Taslak İlanlar" 
                    value={kpis.draftListings} 
                    prefix={<FileTextOutlined style={{ color: '#8c8c8c' }} />} 
                    valueStyle={{ fontSize: 18 }}
                />
            </Card>
        </Col>
        <Col xs={12} md={6}>
            <Card size="small" bordered={false} hoverable>
                <Statistic 
                    title="Takaslananlar" 
                    value={kpis.exchangedListings} 
                    prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} 
                    valueStyle={{ fontSize: 18 }}
                />
            </Card>
        </Col>
        <Col xs={12} md={6}>
             <Card size="small" bordered={false} hoverable>
                <Statistic 
                    title="Bildirimler" 
                    value={kpis.unreadNotifications} 
                    prefix={<BellOutlined style={{ color: '#f5222d' }} />} 
                    valueStyle={{ fontSize: 18 }}
                />
            </Card>
        </Col>
      </Row>

      {/* Main Charts Row */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <Card 
            title="Kullanıcı & İlan Büyümesi (Son 14 Gün)" 
            bordered={false} 
            style={{ height: 400 }}
          >
             <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={newUsersPerDay} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1890ff" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#1890ff" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorListings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#999" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#999" fontSize={12} tickLine={false} axisLine={false} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <Tooltip 
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="top" height={36}/>
                  <Area 
                    name="Yeni Kullanıcılar" 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#1890ff" 
                    fillOpacity={1} 
                    fill="url(#colorUsers)" 
                    strokeWidth={3}
                  />
                  {/* We are overlaying two different datasets that might have different scales, 
                      but for simplicity in this mock, displaying separately might be better.
                      However, combined shows correlation. Let's add listings data to the same chart context 
                      if we want to overlay, or keep them separate. 
                      Actually, let's keep separate charts side-by-side or stacked to avoid scale issues.
                      For this update, I will stick to separate charts but nicer UI.
                  */}
                </AreaChart>
             </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Kategori Dağılımı" bordered={false} style={{ height: 400 }}>
             <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                  >
                    {categoryDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: 'none' }} />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          <Col xs={24} lg={12}>
               <Card title="Günlük İlan Girişleri (Son 14 Gün)" bordered={false}>
                  <div style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={listingsPerDay}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="date" stroke="#999" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#999" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip cursor={{ fill: '#f6f6f6' }} contentStyle={{ borderRadius: 8, border: 'none' }} />
                        <Bar dataKey="count" name="İlan Sayısı" fill="#5E35B1" radius={[4, 4, 0, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                  </div>
               </Card>
          </Col>

          <Col xs={24} lg={12}>
              <Card title="Popüler Ürünler (En Çok Görüntülenen)" bordered={false}>
                 <div style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topViewed} layout="vertical" margin={{ left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                        <XAxis type="number" hide />
                        <YAxis 
                            type="category" 
                            dataKey="name" 
                            width={150} 
                            tick={{ fontSize: 13 }} 
                            tickLine={false} 
                            axisLine={false} 
                        />
                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: 8, border: 'none' }} />
                        <Bar dataKey="views" name="Görüntülenme" fill="#FF8042" radius={[0, 4, 4, 0]} barSize={16}>
                             {topViewed.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={index < 3 ? '#ff7a45' : '#ffbb96'} />
                             ))}
                        </Bar>
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

import React, { useMemo, useState } from 'react';
import { Button, Drawer, Space, List, Tag, Typography, Avatar, Input, Card, Select, Image } from 'antd';
import { UserOutlined, BugOutlined, ShoppingOutlined, DollarOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useMockStore } from '../stores/mockStore';
import type { ReportItem, User, Product } from '../types/models';

const { Text, Title, Paragraph } = Typography;

function formatRelativeTime(value: string) {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    const diff = (new Date().getTime() - d.getTime()) / 1000;
    
    if (diff < 60) return 'Az önce';
    if (diff < 3600) return `${Math.floor(diff / 60)} dakika önce`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`;
    return d.toLocaleDateString('tr-TR');
}

function categoryLabel(c: string) {
    switch(c) {
        case 'bug': return { label: 'SİSTEM HATASI', color: 'volcano', icon: <BugOutlined /> };
        case 'user': return { label: 'KULLANICI', color: 'purple', icon: <UserOutlined /> };
        case 'product': return { label: 'ÜRÜN', color: 'cyan', icon: <ShoppingOutlined /> };
        case 'payment': return { label: 'ÖDEME', color: 'green', icon: <DollarOutlined /> };
        case 'suggestion': return { label: 'ÖNERİ', color: 'magenta', icon: <BulbOutlined /> };
        default: return { label: 'DİĞER', color: 'default', icon: <AppstoreOutlined /> };
    }
}

// Icon for Suggestion (Bulb)
const BulbOutlined = () => (
  <span role="img" aria-label="bulb" className="anticon anticon-bulb">
    <svg viewBox="64 64 896 896" focusable="false" data-icon="bulb" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M632 888H392c-17.7 0-32 14.3-32 32v32c0 17.7 14.3 32 32 32h240c17.7 0 32-14.3 32-32v-32c0-17.7-14.3-32-32-32zM512 64c-181.1 0-328 146.9-328 328 0 121.4 66 227.4 164 284.1V792c0 17.7 14.3 32 32 32h264c17.7 0 32-14.3 32-32v-115.9c98-56.7 164-162.7 164-284.1 0-181.1-146.9-328-328-328z"></path></svg>
  </span>
);

function statusInfo(s: string) {
    switch(s) {
        case 'open': return { label: 'AÇIK', color: 'gold' };
        case 'in_review': return { label: 'İNCELEMEDE', color: 'blue' };
        case 'resolved': return { label: 'ÇÖZÜLDÜ', color: 'green' };
        case 'rejected': return { label: 'REDDEDİLDİ', color: 'red' };
        default: return { label: s.toUpperCase(), color: 'default' };
    }
}

const Reports: React.FC = () => {
  const db = useMockStore((s) => s.db);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  type ReportRow = ReportItem & { 
      key: string;
      reporter?: User;
      targetUser?: User;
      targetProduct?: Product;
  };

  const [selected, setSelected] = useState<ReportRow | null>(null);

  const data = useMemo((): ReportRow[] => {
    const normalizedSearch = search.trim().toLowerCase();
    
    return db.reports.map((r) => {
        return { 
            ...r, 
            key: String(r.id),
            reporter: db.users.find(u => String(u.id) === String(r.reporterUserId)),
            targetUser: db.users.find(u => String(u.id) === String(r.targetUserId)),
            targetProduct: db.products.find(p => String(p.id) === String(r.targetProductId))
        };
    }).filter(r => {
        if (filterType !== 'all' && r.category !== filterType) return false;
        if (filterStatus !== 'all' && r.status !== filterStatus) return false;

        if (!normalizedSearch) return true;
        const inMsg = r.message.toLowerCase().includes(normalizedSearch);
        const inReporter = r.reporter ? (r.reporter.fullName.toLowerCase().includes(normalizedSearch) || r.reporter.username.toLowerCase().includes(normalizedSearch)) : false;
        
        return inMsg || inReporter;
    }).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [db.reports, db.users, db.products, search, filterType, filterStatus]);

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        
        {/* Header & Filters */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap: 16}}>
            <div>
                <Title level={3} style={{ margin: 0 }}>Şikayet ve Öneriler</Title>
                <Text type="secondary">Kullanıcılardan gelen geri bildirimler ({data.length})</Text>
            </div>
            
            <Space wrap>
                <Input.Search
                    placeholder="Ara..."
                    allowClear
                    style={{ width: 250 }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Select
                    defaultValue="all"
                    style={{ width: 140 }}
                    onChange={setFilterType}
                    options={[
                        { value: 'all', label: 'Tüm Konular' },
                        { value: 'suggestion', label: 'Öneriler' },
                        { value: 'bug', label: 'Hatalar' },
                        { value: 'user', label: 'Kullanıcı Rap.' },
                        { value: 'product', label: 'Ürün Rap.' },
                    ]}
                />
                 <Select
                    defaultValue="all"
                    style={{ width: 140 }}
                    onChange={setFilterStatus}
                    options={[
                        { value: 'all', label: 'Tüm Durumlar' },
                        { value: 'open', label: 'Açık' },
                        { value: 'in_review', label: 'İncelemede' },
                        { value: 'resolved', label: 'Çözüldü' },
                    ]}
                />
            </Space>
        </div>

        {/* Card Grid List */}
        <List
            grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 4 }}
            dataSource={data}
            renderItem={(item) => {
                const cat = categoryLabel(item.category);
                const st = statusInfo(item.status);
                
                return (
                    <List.Item>
                        <Card 
                            hoverable 
                            bordered={false}
                            style={{height: '100%', display:'flex', flexDirection:'column'}}
                            bodyStyle={{flex:1, display:'flex', flexDirection:'column', padding: 20}}
                            onClick={() => setSelected(item)}
                        >
                            {/* Header: User */}
                            <div style={{display:'flex', justifyContent:'space-between', marginBottom: 16}}>
                                <Space>
                                    <Avatar src={item.reporter?.avatar} size="large" icon={<UserOutlined />} />
                                    <div>
                                        <div style={{fontWeight: 600, fontSize:15}}>{item.reporter?.fullName ?? 'Bilinmiyor'}</div>
                                        <div style={{fontSize: 12, color:'#999'}}>{formatRelativeTime(item.createdAt)}</div>
                                    </div>
                                </Space>
                                <Tag color={cat.color} style={{marginRight:0, height:24, display:'flex', alignItems:'center', gap:6, borderRadius:12, paddingInline:10}}>
                                    {cat.icon} {cat.label}
                                </Tag>
                            </div>

                            {/* Content */}
                            <Paragraph 
                                ellipsis={{ rows: 3, expandable: false }} 
                                style={{fontSize: 15, color: '#333', lineHeight: 1.6, flex:1, marginBottom: 20}}
                            >
                                {item.message}
                            </Paragraph>

                            {/* Footer: Target Info & Status */}
                            <div style={{marginTop:'auto', paddingTop: 16, borderTop:'1px solid #f0f0f0', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                <Space size={8}>
                                    <Tag color={st.color} variant="filled">{st.label}</Tag>
                                </Space>
                                <Button type="link" size="small" style={{padding:0}}>Detay Gör →</Button>
                            </div>
                        </Card>
                    </List.Item>
                );
            }}
        />
      </Space>

      {/* Drawer Detail View */}
      <Drawer 
          title={
              <Space>
                  <span>Geri Bildirim #{selected?.id ?? ''}</span>
                  {selected && <Tag>{statusInfo(selected.status).label}</Tag>}
              </Space>
          }
          open={!!selected} 
          onClose={() => setSelected(null)} 
          width={600}
      >
        {selected && (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                 {/* Reporter Big Profile */}
                 <div style={{display:'flex', alignItems:'center', gap: 16, paddingBottom: 20, borderBottom:'1px solid #f0f0f0'}}>
                     <Avatar src={data.find(r => r.id === selected.id)?.reporter?.avatar} size={64} />
                     <div>
                         <Title level={4} style={{margin:0}}>{data.find(r => r.id === selected.id)?.reporter?.fullName}</Title>
                         <Text type="secondary">@{data.find(r => r.id === selected.id)?.reporter?.username}</Text>
                         <div style={{marginTop: 4, display:'flex', gap: 8}}>
                            {data.find(r => r.id === selected.id)?.reporter?.role === 'admin' ? <Tag color="red">YÖNETİCİ</Tag> : <Tag>KULLANICI</Tag>}
                            <Text type="secondary" style={{fontSize:12}}>Katılım: {data.find(r => r.id === selected.id)?.reporter?.joinDate.split('T')[0]}</Text>
                         </div>
                     </div>
                 </div>

                 {/* Message Bubble */}
                 <div>
                     <div style={{display:'flex', justifyContent:'space-between', marginBottom: 8}}>
                        <Text type="secondary" style={{fontSize:12, fontWeight:600}}>BİLDİRİM İÇERİĞİ</Text>
                        <Tag color={categoryLabel(selected.category).color}>{categoryLabel(selected.category).label}</Tag>
                     </div>
                     <div style={{background:'#f5f7fa', padding: 20, borderRadius: 12, fontSize: 16, lineHeight: 1.6}}>
                         {selected.message}
                     </div>
                     <div style={{marginTop: 8, textAlign:'right'}}>
                         <Text type="secondary" style={{fontSize: 12}}>{
                         new Date(selected.createdAt).toLocaleString('tr-TR')}</Text>
                     </div>
                 </div>

                 {/* Context Info (Target Product / User) */}
                 {(selected.targetProduct || selected.targetUser) && (
                     <Card size="small" title="İlgili İçerik" style={{background:'#fff'}}>
                         {selected.targetProduct ? (
                             <Space>
                                 <Image width={48} src={selected.targetProduct.imageUrl || undefined} style={{borderRadius:4}} />
                                 <div>
                                     <div style={{fontWeight:600}}>{selected.targetProduct.name}</div>
                                     <Text type="secondary">Ürün ID: {selected.targetProductId}</Text>
                                 </div>
                             </Space>
                         ) : selected.targetUser ? (
                             <Space>
                                 <Avatar src={selected.targetUser.avatar} />
                                 <div>
                                     <div style={{fontWeight:600}}>{selected.targetUser.fullName}</div>
                                     <Text type="secondary">Kullanıcı ID: {selected.targetUserId}</Text>
                                 </div>
                             </Space>
                         ) : null}
                     </Card>
                 )}
                 
                 <div style={{marginTop: 10}}>
                     <Typography.Title level={5}>Yönetici Paneli</Typography.Title>
                     <Input.TextArea 
                        rows={4} 
                        placeholder="Kullanıcıya yanıtınız veya dahili notunuz..." 
                        defaultValue={selected.resolutionNote} 
                        style={{marginBottom: 16}}
                     />
                     
                     <Text type="secondary" style={{fontSize:12, marginBottom: 8, display:'block'}}>DURUM GÜNCELLE</Text>
                     <Space wrap>
                         <Button type={selected.status === 'open' ? 'primary' : 'default'} onClick={() => {}}>Açık</Button>
                         <Button type={selected.status === 'in_review' ? 'primary' : 'default'} onClick={() => {}}>İncelemede</Button>
                         <Button type={selected.status === 'resolved' ? 'primary' : 'default'} style={{background: selected.status === 'resolved' ? '#f6ffed' : '', borderColor: selected.status === 'resolved' ? '#b7eb8f' : '', color: selected.status === 'resolved' ? '#52c41a' : ''}}>Çözüldü Olarak İşaretle</Button>
                         <Button danger type={selected.status === 'rejected' ? 'primary' : 'default'} onClick={() => {}}>Reddet</Button>
                     </Space>
                 </div>
            </Space>
        )}
      </Drawer>
    </div>
  );
};

export default Reports;

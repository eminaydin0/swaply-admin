import React, { useMemo, useState } from 'react';
import { Button, Drawer, Space, Table, Tag, Typography, Avatar, Input, Image, Select } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { useMockStore } from '../stores/mockStore';
import type { ReportItem, User, Product } from '../types/models';

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

function categoryLabel(c: string) {
    switch(c) {
        case 'bug': return { label: 'SİSTEM HATASI', color: 'volcano' };
        case 'user': return { label: 'KULLANICI', color: 'purple' };
        case 'product': return { label: 'ÜRÜN', color: 'cyan' };
        case 'payment': return { label: 'ÖDEME', color: 'green' };
        default: return { label: 'DİĞER', color: 'default' };
    }
}

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
  const [selected, setSelected] = useState<ReportItem | null>(null);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
      current: 1,
      pageSize: 25,
      showSizeChanger: true,
      showTotal: (total) => `Toplam ${total} kayıt`,
  });

  type ReportRow = ReportItem & { 
      key: string;
      reporter?: User;
      targetUser?: User;
      targetProduct?: Product;
  };

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
        if (!normalizedSearch) return true;
        const inMsg = r.message.toLowerCase().includes(normalizedSearch);
        const inReporter = r.reporter ? (r.reporter.fullName.toLowerCase().includes(normalizedSearch) || r.reporter.username.toLowerCase().includes(normalizedSearch)) : false;
        
        return inMsg || inReporter;
    });
  }, [db.reports, db.users, db.products, search]);

  const columns: ColumnsType<ReportRow> = [
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      width: 130,
      filters: [
        { text: 'hata', value: 'bug' },
        { text: 'kullanıcı', value: 'user' },
        { text: 'ürün', value: 'product' },
        { text: 'ödeme', value: 'payment' },
        { text: 'diğer', value: 'other' },
      ],
      onFilter: (value, record) => record.category === value,
      render: (c: string) => {
          const info = categoryLabel(c);
          return <Tag color={info.color}>{info.label}</Tag>;
      },
    },
    { 
        title: 'Bildiren', 
        key: 'reporter', 
        width: 220,
        render: (_v, r) => {
            if (!r.reporter) return <Text type="secondary">Bilinmiyor ({r.reporterUserId})</Text>;
            return (
                <Space>
                    <Avatar src={r.reporter.avatar} />
                    <Space direction="vertical" size={0}>
                        <Text strong>{r.reporter.fullName}</Text>
                        <Text type="secondary" style={{fontSize: 12}}>@{r.reporter.username}</Text>
                    </Space>
                </Space>
            )
        },
        sorter: (a, b) => (a.reporter?.fullName || '').localeCompare(b.reporter?.fullName || ''),
    },
    {
        title: 'Konu (Hedef)',
        key: 'target',
        width: 250,
        render: (_v, r) => {
            if (r.targetProduct) {
                return (
                    <Space>
                        {r.targetProduct.imageUrl ? 
                            <Image width={32} height={32} src={r.targetProduct.imageUrl} style={{borderRadius: 4}} /> : 
                            <div style={{width: 32, height: 32, background:'#eee', borderRadius: 4}} />
                        }
                        <Space direction="vertical" size={0}>
                            <Text strong>Ürün: {r.targetProduct.name}</Text>
                            <Text type="secondary" style={{fontSize: 12}}>ID: {r.targetProduct.id}</Text>
                        </Space>
                    </Space>
                );
            }
            if (r.targetUser) {
                return (
                    <Space>
                        <Avatar size="small" src={r.targetUser.avatar} />
                        <Space direction="vertical" size={0}>
                            <Text strong>Kullanıcı: {r.targetUser.fullName}</Text>
                            <Text type="secondary" style={{fontSize: 12}}>ID: {r.targetUser.id}</Text>
                        </Space>
                    </Space>
                );
            }
            if (r.category === 'bug') return <Text type="secondary">Sistem</Text>;
            return <Text type="secondary">—</Text>;
        }
    },
    { title: 'Mesaj', dataIndex: 'message', key: 'message', ellipsis: true },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      filters: [
        { text: 'açık', value: 'open' },
        { text: 'incelemede', value: 'in_review' },
        { text: 'çözüldü', value: 'resolved' },
        { text: 'reddedildi', value: 'rejected' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (s: string) => {
        const info = statusInfo(s);
        return <Tag color={info.color}>{info.label}</Tag>;
      },
    },
    { 
        title: 'Zaman', 
        dataIndex: 'createdAt', 
        key: 'createdAt', 
        width: 150,
        render: (t) => <Text type="secondary">{formatRelativeTime(t)}</Text>,
        sorter: (a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime(),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_value, r) => <Button size="small" onClick={() => setSelected(r)}>İncele</Button>,
    },
  ];

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
            <Typography.Title level={3} style={{ margin: 0 }}>Raporlar</Typography.Title>
             <Input.Search
                placeholder="Ara: kullanıcı / mesaj"
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
          scroll={{ x: 1200 }}
        />
      </Space>

      <Drawer 
          title={`Rapor #${selected?.id ?? ''}`} 
          open={!!selected} 
          onClose={() => setSelected(null)} 
          width={600}
      >
        {selected && (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                 <div style={{display:'flex', gap: 16}}>
                     {categoryLabel(selected.category).label && <Tag color={categoryLabel(selected.category).color}>{categoryLabel(selected.category).label}</Tag>}
                     {statusInfo(selected.status).label && <Tag color={statusInfo(selected.status).color}>{statusInfo(selected.status).label}</Tag>}
                 </div>

                 <div style={{display:'flex', gap: 24}}>
                     <Space direction="vertical" size={4}>
                         <Text type="secondary" style={{fontSize:12}}>BİLDİREN</Text>
                         {data.find(r => r.id === selected.id)?.reporter ? (
                             <Space>
                                 <Avatar src={data.find(r => r.id === selected.id)?.reporter?.avatar} />
                                 <Text>{data.find(r => r.id === selected.id)?.reporter?.fullName}</Text>
                             </Space>
                         ) : <Text>—</Text>}
                     </Space>

                     <Space direction="vertical" size={4}>
                         <Text type="secondary" style={{fontSize:12}}>HEDEF</Text>
                         {selected.targetProduct ? (
                             <Text>Ürün #{selected.targetProductId}</Text>
                         ) : selected.targetUser ? (
                             <Text>Kullanıcı #{selected.targetUserId}</Text>
                         ) : <Text>—</Text>}
                     </Space>
                 </div>

                 <div>
                     <Typography.Title level={5}>Rapor Mesajı</Typography.Title>
                     <div style={{background:'#f9f9f9', padding: 16, borderRadius: 8}}>
                         <Text>{selected.message}</Text>
                     </div>
                     <div style={{marginTop: 8}}>
                         <Text type="secondary" style={{fontSize: 12}}>{selected.createdAt} tarihinde oluşturuldu.</Text>
                     </div>
                 </div>
                 
                 <div>
                     <Typography.Title level={5}>Yönetici Notu</Typography.Title>
                     <Input.TextArea rows={3} placeholder="Not ekleyin..." defaultValue={selected.resolutionNote} />
                 </div>

                 <div style={{marginTop: 20, paddingTop: 20, borderTop: '1px solid #eee'}}>
                     <Typography.Title level={5}>Durum Güncelle</Typography.Title>
                     <Space wrap>
                         <Button type={selected.status === 'open' ? 'primary' : 'default'}>Açık</Button>
                         <Button type={selected.status === 'in_review' ? 'primary' : 'default'}>İncelemede</Button>
                         <Button type={selected.status === 'resolved' ? 'primary' : 'default'} style={{color: selected.status === 'resolved' ? 'white' : 'green', borderColor:'green', background: selected.status === 'resolved' ? 'green' : 'transparent'}}>Çözüldü</Button>
                         <Button danger type={selected.status === 'rejected' ? 'primary' : 'default'}>Reddet</Button>
                     </Space>
                 </div>
            </Space>
        )}
      </Drawer>
    </div>
  );
};

export default Reports;

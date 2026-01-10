import React, { useMemo, useState } from 'react';
import { Button, Drawer, Dropdown, Space, Table, Tag, Typography, Avatar, Input, Image } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { useMockStore } from '../stores/mockStore';
import type { SwapOffer } from '../types/models';
import type { Product, User } from '../types/models';

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

const Offers: React.FC = () => {
  const db = useMockStore((s) => s.db);
  const forceCancel = useMockStore((s) => s.forceCancelOffer);
  const forceReject = useMockStore((s) => s.forceRejectOffer);
  const forceAccept = useMockStore((s) => s.forceAcceptOffer);

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<SwapOffer | null>(null);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
      current: 1,
      pageSize: 25,
      showSizeChanger: true,
      showTotal: (total) => `Toplam ${total} kayıt`,
  });

  type OfferRow = SwapOffer & {
    key: string;
    initiator?: User;
    targetUser?: User;
    targetProduct?: Product;
    offeredProduct?: Product;
  };

  const data = useMemo((): OfferRow[] => {
    const normalizedSearch = search.trim().toLowerCase();

    return db.offers.map((o) => {
      const initiator = db.users.find((u) => String(u.id) === String(o.initiatorId));
      const targetUser = db.users.find((u) => String(u.id) === String(o.targetUserId));
      const targetProduct = db.products.find((p) => String(p.id) === String(o.targetProductId));
      const offeredProduct = db.products.find((p) => String(p.id) === String(o.offeredProductId));
      return {
        ...o,
        key: String(o.id),
        initiator,
        targetUser,
        targetProduct,
        offeredProduct,
      };
    }).filter(o => {
        if (!normalizedSearch) return true;
        const inInit = o.initiator ? (o.initiator.fullName.toLowerCase().includes(normalizedSearch) || o.initiator.username.toLowerCase().includes(normalizedSearch)) : false;
        const inTargetU = o.targetUser ? (o.targetUser.fullName.toLowerCase().includes(normalizedSearch) || o.targetUser.username.toLowerCase().includes(normalizedSearch)) : false;
        const inProd1 = o.targetProduct ? o.targetProduct.name.toLowerCase().includes(normalizedSearch) : false;
        const inProd2 = o.offeredProduct ? o.offeredProduct.name.toLowerCase().includes(normalizedSearch) : false;
        
        return inInit || inTargetU || inProd1 || inProd2;
    });
  }, [db.offers, db.users, db.products, search]);

  const columns: ColumnsType<OfferRow> = [
    {
      title: 'Teklif Veren',
      key: 'initiator',
      width: 250,
      render: (_value, r) => (
        <Space>
           {r.initiator ? <Avatar src={r.initiator.avatar} /> : <Avatar>U</Avatar>}
           <Space direction="vertical" size={0}>
              <Text strong>{r.initiator?.fullName ?? 'Bilinmiyor'}</Text>
              <Text type="secondary" style={{fontSize: 12}}>@{r.initiator?.username ?? ''}</Text>
           </Space>
        </Space>
      ),
      sorter: (a, b) => (a.initiator?.fullName || '').localeCompare(b.initiator?.fullName || ''),
    },
    {
      title: 'Teklif Alan',
      key: 'target',
      width: 250,
      render: (_value, r) => (
        <Space>
           {r.targetUser ? <Avatar src={r.targetUser.avatar} /> : <Avatar>U</Avatar>}
           <Space direction="vertical" size={0}>
              <Text strong>{r.targetUser?.fullName ?? 'Bilinmiyor'}</Text>
              <Text type="secondary" style={{fontSize: 12}}>@{r.targetUser?.username ?? ''}</Text>
           </Space>
        </Space>
      ),
      sorter: (a, b) => (a.targetUser?.fullName || '').localeCompare(b.targetUser?.fullName || ''),
    },
    {
        title: 'Takas Ürünleri (Verilen -> İstenen)',
        key: 'products',
        width: 420,
        render: (_v, r) => (
            <Space align="center" size={16}>
                <Space>
                    {r.offeredProduct?.imageUrl ? 
                      <Image width={40} height={40} src={r.offeredProduct.imageUrl} style={{borderRadius: 4, objectFit:'cover'}} /> :
                      <div style={{width: 40, height: 40, background:'#eee', borderRadius:4}} />
                    }
                    <Space direction="vertical" size={0}>
                        <Text ellipsis style={{maxWidth: 140}}>{r.offeredProduct?.name || 'Silinmiş Ürün'}</Text>
                        <Tag style={{margin:0, fontSize:10}}>Teklif Edilen</Tag>
                    </Space>
                </Space>
                
                <Text type="secondary" style={{fontSize: 16}}>→</Text>
                
                <Space>
                    {r.targetProduct?.imageUrl ? 
                      <Image width={40} height={40} src={r.targetProduct.imageUrl} style={{borderRadius: 4, objectFit:'cover'}} /> :
                      <div style={{width: 40, height: 40, background:'#eee', borderRadius:4}} />
                    }
                    <Space direction="vertical" size={0}>
                        <Text ellipsis style={{maxWidth: 140}}>{r.targetProduct?.name || 'Silinmiş Ürün'}</Text>
                        <Tag style={{margin:0, fontSize:10}}>İstenen</Tag>
                    </Space>
                </Space>
            </Space>
        )
      },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      filters: [
        { text: 'bekliyor', value: 'pending' },
        { text: 'kabul', value: 'accepted' },
        { text: 'red', value: 'rejected' },
        { text: 'iptal', value: 'cancelled' },
        { text: 'tamamlandı', value: 'completed' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (s: string) => {
        const color =
          s === 'pending' ? 'gold' : s === 'accepted' ? 'green' : s === 'rejected' ? 'red' : s === 'cancelled' ? 'default' : 'blue';
        const label =
          s === 'pending'
            ? 'BEKLİYOR'
            : s === 'accepted'
              ? 'KABUL'
              : s === 'rejected'
                ? 'RED'
                : s === 'cancelled'
                  ? 'İPTAL'
                  : 'TAMAMLANDI';
        return <Tag color={color}>{label}</Tag>;
      },
    },
    { 
        title: 'Zaman', 
        dataIndex: 'createdAt', 
        key: 'createdAt', 
        width: 150,
        render: (t: string) => <Text type="secondary">{formatRelativeTime(t)}</Text>,
        sorter: (a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime(),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_value, r) => {
        const items = [
          {
            key: 'forceAccept',
            label: 'Zorla kabul et',
            disabled: r.status !== 'pending',
            onClick: () => forceAccept(r.id),
          },
          {
            key: 'forceReject',
            label: 'Zorla reddet',
            onClick: () => forceReject(r.id),
          },
          {
            key: 'forceCancel',
            label: 'İptal et',
            onClick: () => forceCancel(r.id),
          },
        ];

        return (
          <Space>
            <Button size="small" onClick={() => setSelected(r)}>
              İncele
            </Button>
            <Dropdown trigger={['click']} menu={{ items }}>
              <Button size="small">...</Button>
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
            <Typography.Title level={3} style={{ margin: 0 }}>Teklifler</Typography.Title>
            <Input.Search
                placeholder="Ara: kullanıcı / ürün"
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
          scroll={{ x: 1400 }}
          expandable={{
            expandedRowRender: (r) => (
                <div style={{padding: '0 16px'}}>
                    <Typography.Paragraph>
                        <Text type="secondary">Mesaj:</Text> {r.message}
                    </Typography.Paragraph>
                </div>
            ),
            rowExpandable: (r) => !!r.message
        }}
        />
      </Space>

      <Drawer
        title={`Teklif #${selected?.id ?? ''}`}
        open={!!selected}
        onClose={() => setSelected(null)}
        width={600}
      >
        {selected && (
           <Space direction="vertical" size="large" style={{width:'100%'}}>
               <div style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid #eee', paddingBottom: 16}}>
                   <div>
                       <Text type="secondary" style={{fontSize:12}}>TEKLİF EDİLEN</Text>
                       <div style={{marginTop: 8}}>
                           {selected.offeredProduct ? 
                              <Space align="start">
                                  <Image width={80} src={selected.offeredProduct.imageUrl || ''} style={{borderRadius: 8}} />
                                  <div>
                                      <div style={{fontWeight:600}}>{selected.offeredProduct.name}</div>
                                      <Text type="secondary">{selected.offeredProduct.categoryName}</Text>
                                  </div>
                              </Space> : <Text type="secondary">Ürün Yok</Text>
                           }
                      </div>
                   </div>
                   <div style={{textAlign:'right'}}>
                       <Text type="secondary" style={{fontSize:12}}>İSTENEN</Text>
                       <div style={{marginTop: 8, display:'flex', justifyContent:'flex-end'}}>
                           {selected.targetProduct ? 
                              <Space align="start" style={{flexDirection:'row-reverse'}}>
                                  <Image width={80} src={selected.targetProduct.imageUrl || ''} style={{borderRadius: 8}} />
                                  <div style={{textAlign:'right'}}>
                                      <div style={{fontWeight:600}}>{selected.targetProduct.name}</div>
                                      <Text type="secondary">{selected.targetProduct.categoryName}</Text>
                                  </div>
                              </Space> : <Text type="secondary">Ürün Yok</Text>
                           }
                      </div>
                   </div>
               </div>
               
               <div>
                   <Typography.Title level={5}>Mesaj</Typography.Title>
                   <div style={{background:'#f9f9f9', padding: 12, borderRadius: 8}}>
                       {selected.message || <Text type="secondary" style={{fontStyle:'italic'}}>Mesaj yok</Text>}
                   </div>
               </div>
               
               <div>
                   <Typography.Title level={5}>Yönetim</Typography.Title>
                   <Space wrap>
                       <Button disabled={selected.status !== 'pending'} onClick={() => forceAccept(selected.id)}>Onayla (Admin)</Button>
                       <Button danger onClick={() => forceReject(selected.id)}>Reddet (Admin)</Button>
                   </Space>
               </div>
          </Space>
        )}
      </Drawer>
    </div>
  );
};

export default Offers;

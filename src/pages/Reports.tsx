import React, { useMemo, useState } from 'react';
import { Button, Drawer, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMockStore } from '../stores/mockStore';
import type { ReportItem } from '../types/models';

const Reports: React.FC = () => {
  const db = useMockStore((s) => s.db);
  const [selected, setSelected] = useState<ReportItem | null>(null);

  type ReportRow = ReportItem & { key: string };
  const data = useMemo((): ReportRow[] => db.reports.map((r) => ({ ...r, key: String(r.id) })), [db.reports]);

  const columns: ColumnsType<ReportRow> = [
    { title: 'Rapor ID', dataIndex: 'id', key: 'id', width: 120 },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      width: 140,
      filters: [
        { text: 'hata', value: 'bug' },
        { text: 'kullanıcı', value: 'user' },
        { text: 'ürün', value: 'product' },
        { text: 'ödeme', value: 'payment' },
        { text: 'diğer', value: 'other' },
      ],
      onFilter: (value, record) => record.category === value,
      render: (c: string) => {
        const label = c === 'bug' ? 'HATA' : c === 'user' ? 'KULLANICI' : c === 'product' ? 'ÜRÜN' : c === 'payment' ? 'ÖDEME' : 'DİĞER';
        return <Tag>{label}</Tag>;
      },
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      filters: [
        { text: 'açık', value: 'open' },
        { text: 'incelemede', value: 'in_review' },
        { text: 'çözüldü', value: 'resolved' },
        { text: 'reddedildi', value: 'rejected' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (s: string) => {
        const color = s === 'open' ? 'gold' : s === 'in_review' ? 'blue' : s === 'resolved' ? 'green' : 'red';
        const label = s === 'open' ? 'AÇIK' : s === 'in_review' ? 'İNCELEMEDE' : s === 'resolved' ? 'ÇÖZÜLDÜ' : 'REDDEDİLDİ';
        return <Tag color={color}>{label}</Tag>;
      },
    },
    { title: 'Bildiren', dataIndex: 'reporterUserId', key: 'reporterUserId', width: 110 },
    { title: 'Hedef Kullanıcı', dataIndex: 'targetUserId', key: 'targetUserId', width: 130 },
    { title: 'Hedef Ürün', dataIndex: 'targetProductId', key: 'targetProductId', width: 120 },
    { title: 'Oluşturma', dataIndex: 'createdAt', key: 'createdAt', width: 200 },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 110,
      fixed: 'right',
      render: (_value, r) => <Button size="small" onClick={() => setSelected(r)}>İncele</Button>,
    },
  ];

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Typography.Title level={3} style={{ margin: 0 }}>Raporlar</Typography.Title>
        <Table
          columns={columns}
          dataSource={data}
          rowKey={(r) => String(r.id)}
          pagination={{
            pageSize: 25,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} kayıt`,
          }}
          size="middle"
          sticky
          scroll={{ x: 1200 }}
        />
      </Space>

      <Drawer title={`Rapor ${selected?.id ?? ''}`} open={!!selected} onClose={() => setSelected(null)} width={720}>
        {selected && (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Space wrap>
              <Tag>{selected.category.toUpperCase()}</Tag>
              <Tag>{selected.status.toUpperCase()}</Tag>
              <Tag>bildiren: {String(selected.reporterUserId ?? '—')}</Tag>
              <Tag>hedef kullanıcı: {String(selected.targetUserId ?? '—')}</Tag>
              <Tag>hedef ürün: {String(selected.targetProductId ?? '—')}</Tag>
            </Space>
            <Typography.Paragraph>{selected.message}</Typography.Paragraph>
            <Typography.Text type="secondary">Oluşturma: {selected.createdAt}</Typography.Text>
          </Space>
        )}
      </Drawer>
    </div>
  );
};

export default Reports;

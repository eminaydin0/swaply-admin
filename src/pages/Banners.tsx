// src/pages/Banners.tsx
import React, { useState } from 'react';
import {
  Typography,
  Button,
  Card,
  Row,
  Col,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  DatePicker,
  Switch,
  InputNumber,
  Popconfirm,
  message
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  LinkOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useMockStore } from '../stores/mockStore';
import type { Banner } from '../types/models';

const { Title, Text, Paragraph } = Typography;

const Banners: React.FC = () => {
  const db = useMockStore((s) => s.db);
  const addBanner = useMockStore((s) => s.addBanner);
  const updateBanner = useMockStore((s) => s.updateBanner);
  const deleteBanner = useMockStore((s) => s.deleteBanner);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [form] = Form.useForm();

  // Sort banners by priority (or id)
  const banners = [...(db.banners || [])].sort((a, b) => a.priority - b.priority);

  const handleEdit = (c: Banner) => {
    setEditingId(c.id);
    form.setFieldsValue({
      ...c,
      dates: [dayjs(c.startDate), dayjs(c.endDate)],
    });
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingId(null);
    form.resetFields();
    // default
    form.setFieldsValue({
      isActive: true,
      priority: 0,
      dates: [dayjs(), dayjs().add(7, 'day')]
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const [start, end] = values.dates;
      
      const payload = {
        title: values.title,
        description: values.description,
        imageUrl: values.imageUrl,
        targetUrl: values.targetUrl,
        startDate: start.format(),
        endDate: end.format(),
        isActive: values.isActive,
        priority: values.priority
      };

      if (editingId) {
        updateBanner(editingId, payload);
        message.success('Banner güncellendi');
      } else {
        addBanner({
          id: Date.now(), // simple id gen
          ...payload,
        } as Banner);
        message.success('Banner oluþturuldu');
      }
      setIsModalOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = (id: string | number) => {
    deleteBanner(id);
    message.success('Banner silindi');
  };

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Banner Yönetimi</Title>
          <Text type='secondary'>Mobil uygulamada görünen banner görsellerini buradan yönetebilirsiniz.</Text>
        </div>
        <Button type='primary' icon={<PlusOutlined />} size='large' onClick={handleCreate}>
          Yeni Banner
        </Button>
      </div>

      {/* Grid */}
      <Row gutter={[24, 24]}>
        {banners.map((c) => {
          const isActive = c.isActive;
          const isExpired = dayjs().isAfter(dayjs(c.endDate));
          
          return (
            <Col xs={24} sm={12} lg={8} xl={6} key={c.id}>
              <Card
                hoverable
                cover={
                  <div style={{ position: 'relative', height: 160, overflow: 'hidden' }}>
                    <img 
                      alt={c.title} 
                      src={c.imageUrl} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                    {!isActive && (
                      <div style={{ 
                        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center' 
                      }}>
                        <Tag color='red' style={{ margin: 0 }}>PASÝF</Tag>
                      </div>
                    )}
                     {isActive && isExpired && (
                      <div style={{ 
                        position: 'absolute', top: 10, right: 10
                      }}>
                        <Tag color='warning'>SÜRESÝ DOLMUÞ</Tag>
                      </div>
                    )}
                  </div>
                }
                actions={[
                  <EditOutlined key='edit' onClick={() => handleEdit(c)} />,
                  <Popconfirm 
                    title='Bannerý silmek istediðinize emin misiniz?' 
                    onConfirm={() => handleDelete(c.id)}
                    okText='Evet'
                    cancelText='Hayýr'
                  >
                    <DeleteOutlined key='delete' style={{ color: 'red' }} />
                  </Popconfirm>
                ]}
              >
                <Card.Meta
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span title={c.title} style={{overflow:'hidden', textOverflow:'ellipsis'}}>{c.title}</span>
                      <Text type='secondary' style={{ fontSize: 12 }}>#{c.priority}</Text>
                    </div>
                  }
                  description={
                    <Space direction='vertical' size={4} style={{width:'100%'}}>
                      <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 8, height: 44 }}>
                        {c.description}
                      </Paragraph>
                      
                      <div style={{fontSize: 12, display:'flex', alignItems:'center', gap: 6, color: '#666'}}>
                        <CalendarOutlined />
                        <span>{dayjs(c.startDate).format('D MMM')} - {dayjs(c.endDate).format('D MMM YYYY')}</span>
                      </div>
                      
                      {c.targetUrl && (
                        <div style={{fontSize: 12, display:'flex', alignItems:'center', gap: 6, color: '#1890ff'}}>
                          <LinkOutlined />
                          <span style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{c.targetUrl}</span>
                        </div>
                      )}
                    </Space>
                  }
                />
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Modal Form */}
      <Modal
        title={editingId ? 'Banner Düzenle' : 'Yeni Banner Oluþtur'}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        width={600}
        okText='Kaydet'
        cancelText='Ýptal'
      >
        <Form
          form={form}
          layout='vertical'
          initialValues={{ priority: 0, isActive: true }}
        >
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item name='title' label='Banner Baþlýðý' rules={[{ required: true }]}>
                <Input placeholder='Örn: Yaz Ýndirimi' />
              </Form.Item>
            </Col>
            <Col span={8}>
               <Form.Item name='priority' label='Öncelik Sýrasý'>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name='description' label='Açýklama' rules={[{ required: true }]}>
            <Input.TextArea rows={3} placeholder='Banner detaylarý...' />
          </Form.Item>

          <Form.Item name='imageUrl' label='Görsel URL' rules={[{ required: true }]}>
             <Input placeholder='https://...' />
          </Form.Item>

          <Form.Item name='targetUrl' label='Hedef URL / Ekran (Opsiyonel)'>
             <Input placeholder='Örn: /kategori/elektronik' />
          </Form.Item>

          <Row gutter={16}>
             <Col span={12}>
                <Form.Item name='dates' label='Baþlangýç - Bitiþ Tarihi' rules={[{ required: true }]}>
                  <DatePicker.RangePicker style={{ width: '100%' }} format='DD.MM.YYYY' />
                </Form.Item>
             </Col>
             <Col span={12}>
                <Form.Item name='isActive' label='Durum' valuePropName='checked'>
                  <Switch checkedChildren='Aktif' unCheckedChildren='Pasif' />
                </Form.Item>
             </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default Banners;

import React from 'react';
import { Button, Card, Col, Divider, Row, Space, Switch, Typography, message, Alert } from 'antd';
import { BgColorsOutlined, DatabaseOutlined, InfoCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { useThemeStore } from '../stores/themeStore';
import { useMockStore } from '../stores/mockStore';

const { Title, Text } = Typography;

const Settings: React.FC = () => {
    const theme = useThemeStore((s) => s.theme);
    const toggleTheme = useThemeStore((s) => s.toggleTheme);
    const regenerate = useMockStore((s) => s.regenerate);
    const seed = useMockStore((s) => s.db.seed);

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ marginBottom: 24 }}>
                <Title level={2} style={{ marginTop: 0 }}>Ayarlar</Title>
                <Text type="secondary">Sistem görünümü ve veri yapılandırması</Text>
            </div>

            <Row gutter={[0, 24]}>
                <Col span={24}>
                    <Card bordered={false} style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
                        <Card.Meta
                            avatar={<BgColorsOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
                            title="Görünüm"
                            description="Arayüz teması ve renk seçenekleri"
                        />
                        <Divider />
                        <Space style={{ width: '100%', justifyContent: 'space-between' }} align="center">
                            <Space orientation="vertical" size={2}>
                                <Text strong>Karanlık Mod</Text>
                                <Text type="secondary" style={{ fontSize: 13 }}>
                                    Koyu renkli tema tercihini etkinleştir
                                </Text>
                            </Space>
                            <Switch 
                                checked={theme === 'dark'} 
                                onChange={toggleTheme} 
                            />
                        </Space>
                    </Card>
                </Col>

                <Col span={24}>
                    <Card bordered={false} style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
                        <Card.Meta
                            avatar={<DatabaseOutlined style={{ fontSize: 24, color: '#52c41a' }} />}
                            title="Veri Tabanı"
                            description="Mock veri yönetimi ve simülasyon ayarları"
                        />
                        <Divider />
                        
                        <Space orientation="vertical" style={{ width: '100%' }} size="middle">
                            <Alert 
                                message="Geliştirici Modu"
                                description={`Aktif Seed Değeri: ${seed}`}
                                type="info"
                                showIcon
                                style={{ borderRadius: 6 }}
                            />
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Space orientation="vertical" size={2}>
                                    <Text strong>Verileri Sıfırla</Text>
                                    <Text type="secondary" style={{ fontSize: 13 }}>
                                        Tüm tabloları yeni rastgele verilerle doldurur
                                    </Text>
                                </Space>
                                <Button
                                    danger
                                    icon={<ReloadOutlined />}
                                    onClick={() => {
                                        regenerate();
                                        message.success('Veri tabanı başarıyla yenilendi');
                                    }}
                                >
                                    Yenile
                                </Button>
                            </div>
                        </Space>
                    </Card>
                </Col>

                <Col span={24}>
                    <Card bordered={false} style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
                        <Card.Meta
                            avatar={<InfoCircleOutlined style={{ fontSize: 24, color: '#722ed1' }} />}
                            title="Uygulama Bilgisi"
                        />
                        <Divider />
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8px' }}>
                            <Text type="secondary">Admin Panel Versiyonu</Text>
                            <Text strong code>v1.2.0</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 8px 0', marginTop: 8 }}>
                            <Text type="secondary">Build</Text>
                            <Text type="secondary">2024.10.25</Text>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Settings;

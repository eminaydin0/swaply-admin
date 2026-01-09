import React from 'react';
import { Button, Card, Descriptions, Divider, Space, Switch, Typography, message } from 'antd';
import { useThemeStore } from '../stores/themeStore';
import { useMockStore } from '../stores/mockStore';

const Settings: React.FC = () => {
    const theme = useThemeStore((s) => s.theme);
    const toggleTheme = useThemeStore((s) => s.toggleTheme);
    const regenerate = useMockStore((s) => s.regenerate);
    const seed = useMockStore((s) => s.db.seed);

    return (
        <Space direction="vertical" size="large" style={{ width: '100%', maxWidth: 860 }}>
            <Typography.Title level={3} style={{ margin: 0 }}>Ayarlar</Typography.Title>

            <Card title="Tema">
                <Space>
                    <Typography.Text>Tema tercihi (localStorage: <Typography.Text code>theme_preference</Typography.Text>)</Typography.Text>
                    <Switch checked={theme === 'dark'} onChange={() => toggleTheme()} />
                    <Typography.Text type="secondary">{theme}</Typography.Text>
                </Space>
            </Card>

            <Card title="Sahte Veri">
                <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="Seed">{seed}</Descriptions.Item>
                </Descriptions>

                <Divider />

                <Space>
                    <Button
                        type="primary"
                        onClick={() => {
                            regenerate();
                            message.success('Sahte veri yeniden üretildi.');
                        }}
                    >
                        Mock DB Yenile
                    </Button>
                    <Typography.Text type="secondary">Deterministik seed → stabil dashboard.</Typography.Text>
                </Space>
            </Card>
        </Space>
    );
};

export default Settings;

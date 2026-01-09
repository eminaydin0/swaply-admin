import React, { useState } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  AppstoreOutlined,
  RetweetOutlined,
  CrownOutlined,
  MessageOutlined,
  BellOutlined,
  FileTextOutlined,
  SettingOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Button, Space, Switch, Typography, theme } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useThemeStore } from '../stores/themeStore';

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const themePref = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  
  const navigate = useNavigate();
  const location = useLocation();

  const siderWidth = 220;
  const siderCollapsedWidth = 80;
  const headerHeight = 64;

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={siderWidth}
        collapsedWidth={siderCollapsedWidth}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          overflow: 'auto',
          zIndex: 100,
        }}
      >
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', textAlign: 'center', color: '#fff', lineHeight: '32px' }}>
             {collapsed ? 'SW' : 'SWAPLY ADMIN'}
        </div>
        <Menu
          theme={themePref === 'dark' ? 'dark' : 'light'}
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={({ key }) => navigate(key)}
          items={[
            {
              key: '/',
              icon: <DashboardOutlined />,
              label: 'Gösterge Paneli',
            },
            {
              key: '/users',
              icon: <UserOutlined />,
              label: 'Kullanıcılar',
            },
            {
              key: '/listings',
              icon: <AppstoreOutlined />,
              label: 'İlanlar',
            },
            {
              key: '/offers',
              icon: <RetweetOutlined />,
              label: 'Teklifler',
            },
            {
              key: '/vitrin',
              icon: <CrownOutlined />,
              label: 'Vitrin / Premium',
            },
            {
              key: '/chats',
              icon: <MessageOutlined />,
              label: 'Sohbetler',
            },
            {
              key: '/notifications',
              icon: <BellOutlined />,
              label: 'Bildirimler',
            },
            {
              key: '/reports',
              icon: <FileTextOutlined />,
              label: 'Raporlar',
            },
            {
              key: '/settings',
              icon: <SettingOutlined />,
              label: 'Ayarlar',
            },
          ]}
        />
      </Sider>
      <Layout
        style={{
          marginLeft: collapsed ? siderCollapsedWidth : siderWidth,
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        <Header
          style={{
            padding: 0,
            height: headerHeight,
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />

          <Space style={{ paddingRight: 16 }}>
            <Space size={8}>
              <BulbOutlined />
              <Typography.Text type="secondary">{themePref === 'dark' ? 'Koyu' : 'Açık'}</Typography.Text>
              <Switch checked={themePref === 'dark'} onChange={() => toggleTheme()} />
            </Space>
          </Space>
        </Header>
        <Content
          style={{
            margin: 16,
            padding: 24,
            height: `calc(100vh - ${headerHeight}px - 32px)`,
            overflow: 'auto',
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;

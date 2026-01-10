import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Checkbox, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import logo from '../assets/logo.png'; 
import Loader from '../components/Loader';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const onFinish = (values: {username: string; password: string}) => {
    setLoading(true);
    // Mock login delay
    setTimeout(() => {
        // Hardcoded check for demo purposes
        if (values.username === 'admin' && values.password === 'admin123') {
            login(values.username);
            message.success('Giriş başarılı, yönlendiriliyor...');
            navigate('/');
        } else {
            message.error('Kullanıcı adı veya şifre hatalı!');
            setLoading(false);
        }
    }, 800);
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#f0f2f5',
      flexDirection: 'column'
    }}>
      {loading && <Loader fullScreen tip="Oturum açılıyor..." />}
      
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <img src={logo} alt="Swaply" style={{ height: 120, marginBottom: 24 }} />
          <Title level={3} style={{ margin: 0, color: '#333' }}>Swaply Yönetim Paneli</Title>
          <Text type="secondary">Giriş yaparak devam edin</Text>
      </div>
      
      <Card style={{ width: 380, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <Form
          name="login_form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Lütfen kullanıcı adınızı girin!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Kullanıcı Adı" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Lütfen şifrenizi girin!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Şifre" />
          </Form.Item>

          <Form.Item>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Beni Hatırla</Checkbox>
            </Form.Item>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }} loading={loading}>
              Giriş Yap
            </Button>
            <div style={{ marginTop: 16, textAlign: 'center', fontSize: 12, color: '#999' }}>
               Demo Giriş: admin / admin123
            </div>
          </Form.Item>
        </Form>
      </Card>
      
      <div style={{ marginTop: 40, color: '#ccc', fontSize: 12 }}>
        &copy; {new Date().getFullYear()} Swaply Inc. Tüm hakları saklıdır.
      </div>
    </div>
  );
};

export default Login;

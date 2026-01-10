import React from 'react';
import { Spin } from 'antd';

interface LoaderProps {
  tip?: string;
  fullScreen?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ tip = 'Yükleniyor...', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(255, 255, 255, 0.8)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: 16
      }}>
        <Spin size="large" />
        <div style={{ color: '#1890ff', fontWeight: 500 }}>{tip}</div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      minHeight: 200,
      padding: 20
    }}>
      <Spin size="large" tip={tip} />
    </div>
  );
};

export default Loader;

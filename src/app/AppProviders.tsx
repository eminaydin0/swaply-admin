import React from 'react';
import { ConfigProvider, theme as antdTheme, App as AntdApp } from 'antd';
import trTR from 'antd/locale/tr_TR';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import { useThemeStore } from '../stores/themeStore';

const SWAPLY_TOKENS = {
  colorPrimary: '#00aae4',
  colorSuccess: '#4CAF50',
  colorError: '#F44336',
};

export const AppProviders: React.FC<React.PropsWithChildren> = ({ children }) => {
  const theme = useThemeStore((s) => s.theme);

  dayjs.locale('tr');

  return (
    <ConfigProvider
      locale={trTR}
      theme={{
        token: SWAPLY_TOKENS,
        algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      }}
    >
      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  );
};

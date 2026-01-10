import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Loader from './components/Loader';
import { useAuthStore } from './stores/authStore';
import './App.css';

// Lazy load pages
const MainLayout = lazy(() => import('./layouts/MainLayout'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Users = lazy(() => import('./pages/Users'));
const UserDetail = lazy(() => import('./pages/UserDetail'));
const Listings = lazy(() => import('./pages/Listings'));
const Offers = lazy(() => import('./pages/Offers'));
const Vitrin = lazy(() => import('./pages/Vitrin'));
const Chats = lazy(() => import('./pages/Chats'));
const ChatThread = lazy(() => import('./pages/ChatThread'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Reports = lazy(() => import('./pages/Reports'));
const Banners = lazy(() => import('./pages/Banners'));
const Settings = lazy(() => import('./pages/Settings'));

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Suspense fallback={<Loader fullScreen tip="Uygulama yükleniyor..." />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="users/:userId" element={<UserDetail />} />
          <Route path="listings" element={<Listings />} />
          <Route path="offers" element={<Offers />} />
          <Route path="vitrin" element={<Vitrin />} />
          <Route path="banners" element={<Banners />} />
          <Route path="chats" element={<Chats />} />
          <Route path="chats/:threadId" element={<ChatThread />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default App;

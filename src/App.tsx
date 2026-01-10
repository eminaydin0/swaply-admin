import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Users from './pages/Users';
import UserDetail from './pages/UserDetail';
import Settings from './pages/Settings';
import Listings from './pages/Listings';
import Offers from './pages/Offers';
import Vitrin from './pages/Vitrin';
import Chats from './pages/Chats';
import ChatThread from './pages/ChatThread';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import Banners from './pages/Banners';
import { useAuthStore } from './stores/authStore';
import './App.css';

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
  );
};

export default App;

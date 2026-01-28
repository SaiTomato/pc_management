import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

import Login from './pages/Login';
import PCList from './pages/PCList';
import PCDetail from './pages/PCDetail';
import PCEdit from './pages/PCEdit';
import PCNew from './pages/PCNew';

import PrivateRoute from './components/PrivateRoute';
import './App.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 登录 */}
          <Route path="/login" element={<Login />} />

          {/* PC 一览 */}
          <Route
            path="/pcs"
            element={
              <PrivateRoute>
                <PCList />
              </PrivateRoute>
            }
          />

          {/* PC 新建（管理员用，之后可再加权限） */}
          <Route
            path="/pcs/new"
            element={
              <PrivateRoute>
                <PCNew />
              </PrivateRoute>
            }
          />

          {/* PC 详情（普通用户 / PATCH 用） */}
          <Route
            path="/pcs/:id"
            element={
              <PrivateRoute>
                <PCDetail />
              </PrivateRoute>
            }
          />

          {/* PC 编辑（管理员 PUT） */}
          <Route
            path="/pcs/:id/edit"
            element={
              <PrivateRoute>
                <PCEdit />
              </PrivateRoute>
            }
          />

          {/* 根路径 */}
          <Route path="/" element={<Navigate to="/pcs" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;

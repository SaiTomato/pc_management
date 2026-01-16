import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import PCList from './pages/PCList';
import PCDetail from './pages/PCDetail';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/pcs"
            element={
              <PrivateRoute>
                <PCList />
              </PrivateRoute>
            }
          />
          <Route
            path="/pcs/new"
            element={
              <PrivateRoute>
                <PCDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/pcs/:id"
            element={
              <PrivateRoute>
                <PCDetail />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/pcs" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;

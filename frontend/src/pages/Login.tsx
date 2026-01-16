import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/pcs');
    } catch (err: any) {
      setError(err.response?.data?.error || 'ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="login-container">
      <div className="login-wrapper">
        <Card className="login-card">
          <Card.Body>
            <Card.Title className="text-center mb-4">
              <h2>PC管理システム</h2>
            </Card.Title>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>ユーザー名</Form.Label>
                <Form.Control
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>パスワード</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>
              <Button
                variant="primary"
                type="submit"
                className="w-100"
                disabled={loading}
              >
                {loading ? 'ログイン中...' : 'ログイン'}
              </Button>
            </Form>
            <div className="mt-3 text-center text-muted small">
              <p>デモ用: admin / admin</p>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default Login;

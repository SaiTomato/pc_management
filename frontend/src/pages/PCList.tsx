import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Table,
  Button,
  Form,
  InputGroup,
  Spinner,
  Alert,
  Badge,
  Navbar,
  Nav,
} from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { pcService } from '../services/pcService';
import type { PC } from '../services/pcType';
import './PCList.css';

const PCList: React.FC = () => {
  const [pcs, setPCs] = useState<PC[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);

  const { logout } = useAuth();
  const navigate = useNavigate();

  const loadPCs = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await pcService.getPCs(page, limit, search);

      setPCs(response.data);
      setTotal(response.total);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'PC一覧の取得に失敗しました'
      );
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    loadPCs();
  }, [loadPCs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('このPCを削除しますか？')) return;

    try {
      await pcService.deletePC(id);
      loadPCs();
    } catch (err: any) {
      alert(
        err.response?.data?.message || '削除に失敗しました'
      );
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: 'success',
      inactive: 'secondary',
      maintenance: 'warning',
    };
    const labels: Record<string, string> = {
      active: '稼働中',
      inactive: '停止中',
      maintenance: 'メンテナンス中',
    };

    return (
      <Badge bg={variants[status] || 'secondary'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container fluid>
          <Navbar.Brand>PC管理システム</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Button variant="outline-light" onClick={logout}>
                ログアウト
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid className="main-container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>PC一覧</h2>
          <Button variant="primary" onClick={() => navigate('/pcs/new')}>
            + 新規登録
          </Button>
        </div>

        <Form onSubmit={handleSearch} className="mb-4">
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="PC名、使用者、用途で検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="outline-secondary" type="submit">
              検索
            </Button>
          </InputGroup>
        </Form>

        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">読み込み中...</span>
            </Spinner>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>PC名</th>
                    <th>使用者</th>
                    <th>用途</th>
                    <th>設置場所</th>
                    <th>ステータス</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {pcs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center">
                        データがありません
                      </td>
                    </tr>
                  ) : (
                    pcs.map((pc) => (
                      <tr key={pc.id}>
                        <td>{pc.id}</td>
                        <td>{pc.name}</td>
                        <td>{pc.username || '-'}</td>
                        <td>{pc.usefor || '-'}</td>
                        <td>{pc.place || '-'}</td>
                        <td>{getStatusBadge(pc.status)}</td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => navigate(`/pcs/${pc.id}`)}
                            className="me-2"
                          >
                            詳細
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(pc.id)}
                          >
                            削除
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-4">
                <Button
                  variant="outline-primary"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="me-2"
                >
                  前へ
                </Button>
                <span className="align-self-center me-2">
                  ページ {page} / {totalPages} (全{total}件)
                </span>
                <Button
                  variant="outline-primary"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  次へ
                </Button>
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
};

export default PCList;
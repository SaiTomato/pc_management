import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  Navbar,
  Nav,
  Row,
  Col,
} from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { pcService, PCInput } from '../services/pcService';
import './PCDetail.css';

const PCDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = !id;
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [formData, setFormData] = useState<PCInput>({
    name: '',
    manufacturer: '',
    model: '',
    serialNumber: '',
    os: '',
    cpu: '',
    memory: '',
    storage: '',
    status: 'active',
    purchaseDate: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadPC = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const pc = await pcService.getPC(parseInt(id!));
      setFormData({
        name: pc.name,
        manufacturer: pc.manufacturer,
        model: pc.model,
        serialNumber: pc.serialNumber || '',
        os: pc.os || '',
        cpu: pc.cpu || '',
        memory: pc.memory || '',
        storage: pc.storage || '',
        status: pc.status,
        purchaseDate: pc.purchaseDate || '',
        notes: pc.notes || '',
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'PC情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [id]);
  
  useEffect(() => {
    if (!isNew) {
      loadPC();
    }
  }, [isNew, loadPC]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (isNew) {
        await pcService.createPC(formData);
      } else {
        await pcService.updatePC(parseInt(id!), formData);
      }
      navigate('/pcs');
    } catch (err: any) {
      setError(err.response?.data?.error || '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">読み込み中...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container fluid>
          <Navbar.Brand>PC管理システム</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Button variant="outline-light" onClick={() => navigate('/pcs')} className="me-2">
                PC一覧へ
              </Button>
              <Button variant="outline-light" onClick={logout}>
                ログアウト
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid className="main-container">
        <Card>
          <Card.Header>
            <h3>{isNew ? 'PC新規登録' : 'PC詳細・編集'}</h3>
          </Card.Header>
          <Card.Body>
            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>PC名 <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>ステータス</Form.Label>
                    <Form.Select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="active">稼働中</option>
                      <option value="inactive">停止中</option>
                      <option value="maintenance">メンテナンス中</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>メーカー <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      name="manufacturer"
                      value={formData.manufacturer}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>モデル <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>シリアル番号</Form.Label>
                    <Form.Control
                      type="text"
                      name="serialNumber"
                      value={formData.serialNumber}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>OS</Form.Label>
                    <Form.Control
                      type="text"
                      name="os"
                      value={formData.os}
                      onChange={handleChange}
                      placeholder="例: Windows 11, macOS Sonoma"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>CPU</Form.Label>
                    <Form.Control
                      type="text"
                      name="cpu"
                      value={formData.cpu}
                      onChange={handleChange}
                      placeholder="例: Intel Core i7-12700"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>メモリ</Form.Label>
                    <Form.Control
                      type="text"
                      name="memory"
                      value={formData.memory}
                      onChange={handleChange}
                      placeholder="例: 16GB"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>ストレージ</Form.Label>
                    <Form.Control
                      type="text"
                      name="storage"
                      value={formData.storage}
                      onChange={handleChange}
                      placeholder="例: 512GB SSD"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>購入日</Form.Label>
                    <Form.Control
                      type="date"
                      name="purchaseDate"
                      value={formData.purchaseDate}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>備考</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                />
              </Form.Group>

              <div className="d-flex justify-content-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => navigate('/pcs')}
                  disabled={saving}
                >
                  キャンセル
                </Button>
                <Button variant="primary" type="submit" disabled={saving}>
                  {saving ? '保存中...' : '保存'}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default PCDetail;

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
import { pcService } from '../services/pcService';
import type { PCInput } from '../services/pcType';
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
    status: 'inactive',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadPC = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const pc = await pcService.getPC(Number(id));
      setFormData({
        name: pc.name,
        manufacturer: pc.manufacturer,
        model: pc.model,
        serial_number: pc.serial_number,
        os: pc.os,
        cpu: pc.cpu,
        memory: pc.memory,
        storage: pc.storage,
        status: pc.status,
        purchase_date: pc.purchase_date?.slice(0, 10),
        username: pc.username,
        place: pc.place,
        usefor: pc.usefor,
        notes: pc.notes,
      });
    } catch {
      setError('PC情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!isNew) loadPC();
  }, [isNew, loadPC]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (isNew) {
        await pcService.createPC(formData);
      } else {
        // 普通编辑用 PATCH（安全）
        await pcService.patchPC(Number(id), {
          status: formData.status,
          username: formData.username,
          place: formData.place,
          usefor: formData.usefor,
        });
      }
      navigate('/pcs');
    } catch (err: any) {
      setError(err.response?.data?.message || '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-5">読み込み中...</div>;
  }

  return (
    <>
      <Navbar bg="dark" variant="dark">
        <Container fluid>
          <Navbar.Brand>PC管理システム</Navbar.Brand>
          <Nav className="ms-auto">
            <Button variant="outline-light" onClick={() => navigate('/pcs')}>
              PC一覧へ
            </Button>
            <Button variant="outline-light" className="ms-2" onClick={logout}>
              ログアウト
            </Button>
          </Nav>
        </Container>
      </Navbar>

      <Container className="main-container">
        <Card>
          <Card.Header>
            <h3>{isNew ? 'PC新規登録' : 'PC詳細'}</h3>
          </Card.Header>
          <Card.Body>
            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>PC名</Form.Label>
                    <Form.Control name="name" value={formData.name} disabled />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>ステータス</Form.Label>
                    <Form.Select name="status" value={formData.status} onChange={handleChange}>
                      <option value="active">稼働中</option>
                      <option value="inactive">停止中</option>
                      <option value="maintenance">メンテナンス</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>使用者</Form.Label>
                    <Form.Control
                      name="username"
                      value={formData.username || ''}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>設置場所</Form.Label>
                    <Form.Select name="place" value={formData.place || ''} onChange={handleChange}>
                      <option value="office">オフィス</option>
                      <option value="worksite">現場</option>
                      <option value="remote">リモート</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>用途</Form.Label>
                <Form.Control
                  name="usefor"
                  value={formData.usefor || ''}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>備考</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="notes"
                  value={formData.notes || ''}
                  disabled
                />
              </Form.Group>

              <div className="text-end">
                <Button type="submit" disabled={saving}>
                  {saving ? '保存中...' : '保存'}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
};

export default PCDetail;
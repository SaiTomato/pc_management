import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Navbar, Nav, Button, Alert } from 'react-bootstrap';
import { pcService } from '../services/pcService';
import type { PCInput } from '../services/pcType';
import PCForm from '../components/PCForm';

const PCNew: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const initialData: PCInput = {
    name: '',
    manufacturer: '',
    model: '',
    status: 'inactive',
    serial_number: '',
    os: '',
    cpu: '',
    memory: '',
    storage: '',
    purchase_date: '',
    username: '',
    place: 'office',
    usefor: '',
    notes: '',
  };

  const handleSubmit = async (data: PCInput) => {
    try {
      setSaving(true);
      setError('');
      await pcService.createPC(data);
      navigate('/pcs');
    } catch (err: any) {
      setError(err.response?.data?.message || 'PCの新規登録に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Navbar bg="dark" variant="dark">
        <Container fluid>
          <Navbar.Brand>PC管理システム</Navbar.Brand>
          <Nav className="ms-auto">
            <Button variant="outline-light" onClick={() => navigate('/pcs')}>
              PC一覧へ
            </Button>
          </Nav>
        </Container>
      </Navbar>

      <Container className="main-container">
        {error && <Alert variant="danger">{error}</Alert>}

        <PCForm
          title="PC新規登録"
          initialData={initialData}
          editableAll
          submitting={saving}
          onSubmit={handleSubmit}
        />
      </Container>
    </>
  );
};

export default PCNew;
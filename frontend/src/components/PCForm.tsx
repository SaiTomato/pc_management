import React, { useEffect, useState } from 'react';
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  Row,
  Col,
} from 'react-bootstrap';
import type { PCInput } from '../services/pcType';

interface PCFormProps {
  title: string;
  initialData: PCInput;

  onSubmit: (data: PCInput) => void | Promise<void>;

  submitting?: boolean;
  error?: string;

  editableAll?: boolean; // admin = true, user = false
  editableFields?: (keyof PCInput)[];

  hideSubmit?: boolean;
}

const PCForm: React.FC<PCFormProps> = ({
  title,
  initialData,
  onSubmit,
  submitting = false,
  error,
  editableAll = true,
  editableFields,
  hideSubmit = false,
}) => {
  const [formData, setFormData] = useState<PCInput>(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);
  
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isEditable = (field: keyof PCInput) => {
    if (editableAll) return true;
    return editableFields?.includes(field) ?? false;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  return (
    <Container className="main-container">
      <Card>
        <Card.Header>
          <h3>{title}</h3>
        </Card.Header>

        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>PC名</Form.Label>
                  <Form.Control
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditable('name')}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>ステータス</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status || 'active'}
                    onChange={handleChange}
                  >
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
                  <Form.Label>メーカー</Form.Label>
                  <Form.Control
                    name="manufacturer"
                    value={formData.manufacturer || ''}
                    onChange={handleChange}
                    disabled={!isEditable('manufacturer')}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>モデル</Form.Label>
                  <Form.Control
                    name="model"
                    value={formData.model || ''}
                    onChange={handleChange}
                    disabled={!isEditable('model')}
                  />
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
                  <Form.Select
                    name="place"
                    value={formData.place || ''}
                    onChange={handleChange}
                  >
                    <option value="">--</option>
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
                onChange={handleChange}
                disabled={!isEditable('notes')}
              />
            </Form.Group>

            {!hideSubmit && (
            <div className="text-end">
                <Button type="submit" disabled={submitting}>
                {submitting ? '保存中...' : '保存'}
                </Button>
            </div>
            )}
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PCForm;

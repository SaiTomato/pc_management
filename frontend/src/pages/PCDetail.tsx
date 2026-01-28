import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spinner, Alert, Button } from 'react-bootstrap';
import PCForm from '../components/PCForm';
import { pcService } from '../services/pcService';
import type { PCInput } from '../services/pcType';
import { useAuth } from '../contexts/AuthContext';

const PCDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<PCInput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!id) return;

    const fetchPC = async () => {
      try {
        const pc = await pcService.getPC(Number(id));

        const detail: PCInput = {
          name: pc.name,
          manufacturer: pc.manufacturer,
          model: pc.model,
          serial_number: pc.serial_number,
          os: pc.os,
          cpu: pc.cpu,
          memory: pc.memory,
          storage: pc.storage,
          status: pc.status,
          purchase_date: pc.purchase_date,
          username: pc.username,
          place: pc.place,
          usefor: pc.usefor,
          notes: pc.notes,
        };

        setData(detail);
      } catch (err) {
        console.error(err);
        setError('PC情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchPC();
  }, [id]);

  const handleSubmit = async (formData: PCInput) => {
    if (!id) return;

    try {
      await pcService.patchPC(Number(id), {
        status: formData.status,
        username: formData.username,
        place: formData.place,
        usefor: formData.usefor,
      });

      navigate('/pcs');
    } catch (err) {
      console.error(err);
      setError('更新に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (!data) {
    return <Alert variant="danger">PCが見つかりません</Alert>;
  }

  return (
    <>
      <PCForm
        title="PC詳細"
        initialData={data}
        editableAll={false}
        editableFields={['status', 'username', 'place', 'usefor']}
        hideSubmit={false} 
        error={error}
        onSubmit={handleSubmit}
      />

      {isAdmin && (
        <div className="text-center mt-3">
          <Button
            variant="primary"
            onClick={() => navigate(`/pcs/${id}/edit`)}
          >
            管理者として編集
          </Button>
        </div>
      )}

      <div className="text-center mt-3">
        <Button variant="secondary" onClick={() => navigate('/pcs')}>
          一覧へ戻る
        </Button>
      </div>
    </>
  );
};

export default PCDetail;

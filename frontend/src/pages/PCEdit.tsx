import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spinner, Alert } from 'react-bootstrap';
import PCForm from '../components/PCForm';
import { pcService } from '../services/pcService';
import type { PCInput } from '../services/pcType';

const PCEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [initialData, setInitialData] = useState<PCInput | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!id) return;

    const fetchPC = async () => {
      try {
        const pc = await pcService.getPC(Number(id));

        // PC → PCInput 変換
        const data: PCInput = {
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

        setInitialData(data);
      } catch (err) {
        console.error(err);
        setError('PC情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchPC();
  }, [id]);

  const handleSubmit = async (data: PCInput) => {
    if (!id) return;

    try {
      setSaving(true);
      setError(undefined);

      await pcService.updatePC(Number(id), data);

      // 成功後：一覧へ
      navigate('/pcs');
    } catch (err) {
      console.error(err);
      setError('更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (!initialData) {
    return <Alert variant="danger">PCが見つかりません</Alert>;
  }

  return (
    <PCForm
      title="PC編集"
      initialData={initialData}
      editableAll
      submitting={saving}
      error={error}
      onSubmit={handleSubmit}
    />
  );
};

export default PCEdit;

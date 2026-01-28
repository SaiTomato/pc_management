// 列表 & 详情用
export interface PC {
  id: number;
  name: string;
  manufacturer: string;
  model: string;
  serial_number?: string;
  os?: string;
  cpu?: string;
  memory?: string;
  storage?: string;
  status: 'active' | 'inactive' | 'maintenance';
  purchase_date?: string;
  username?: string;
  place?: 'office' | 'worksite' | 'remote';
  usefor?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// 新建 / PUT（管理员）
export interface PCInput {
  name: string;
  manufacturer: string;
  model: string;
  serial_number?: string;
  os?: string;
  cpu?: string;
  memory?: string;
  storage?: string;
  status?: 'active' | 'inactive' | 'maintenance';
  purchase_date?: string;
  username?: string;
  place?: 'office' | 'worksite' | 'remote';
  usefor?: string;
  notes?: string;
}

// PATCH（普通用户）
export interface PCPatchInput {
  status?: 'active' | 'inactive' | 'maintenance';
  username?: string;
  place?: 'office' | 'worksite' | 'remote';
  usefor?: string;
}
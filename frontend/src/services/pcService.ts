import { api } from './api';
import type { PC, PCInput, PCPatchInput } from './pcType';

export interface PCListResponse {
  data: PC[];
  total: number;
  page: number;
  limit: number;
}

export const pcService = {
  // PC 一览
  getPCs: async (
    page = 1,
    limit = 10,
    search = ''
  ): Promise<PCListResponse> => {
    const response = await api.get('/pcs', {
      params: { page, limit, search },
    });
    return response.data;
  },

  // PC 详情
  getPC: async (id: number): Promise<PC> => {
    const response = await api.get(`/pcs/${id}`);
    return response.data;
  },

  // 新增 PC
  createPC: async (pc: PCInput): Promise<PC> => {
    const response = await api.post('/pcs', pc);
    return response.data;
  },

  // ⭐ 普通用户 PATCH（你之前缺的）
  patchPC: async (id: number, pc: PCPatchInput): Promise<PC> => {
    const response = await api.patch(`/pcs/${id}`, pc);
    return response.data;
  },

  // ⭐ 管理员 PUT（完整更新）
  updatePC: async (id: number, pc: PCInput): Promise<PC> => {
    const response = await api.put(`/pcs/${id}`, pc);
    return response.data;
  },

  // 管理员删除
  deletePC: async (id: number): Promise<void> => {
    await api.delete(`/pcs/${id}`);
  },
};
import { client } from '../client';
import type { PaginatedData, PaginationParams } from '../types';
import type { User, Role } from '@/types/models';

export interface UpdateUserRequest {
  name: string;
  email: string;
  roleId: number;
}

export const usersApi = {
  list: async (params?: PaginationParams): Promise<PaginatedData<User>> => {
    const response = await client.get<PaginatedData<User>>('/api/Users', { params });
    return response.data;
  },

  get: async (id: number): Promise<User> => {
    const response = await client.get<User>(`/api/Users/${id}`);
    return response.data;
  },

  update: async (id: number, body: UpdateUserRequest): Promise<User> => {
    const response = await client.put<User>(`/api/Users/${id}`, body);
    return response.data;
  },

  patchActive: async (id: number, active: boolean): Promise<void> => {
    await client.patch(`/api/Users/${id}/active`, { active });
  },

  delete: async (id: number): Promise<void> => {
    await client.delete(`/api/Users/${id}`);
  },
};

export const rolesApi = {
  list: async (): Promise<PaginatedData<Role>> => {
    const response = await client.get<PaginatedData<Role>>('/api/Roles', { params: { pageSize: 50 } });
    return response.data;
  },
};

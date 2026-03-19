import { client } from '../client';
import type { PaginatedData, PaginationParams } from '../types';
import type { User, Role } from '@/types/models';

export interface UpdateUserRequest {
  name: string;
  email: string;
  roleId: number;
}

export async function listUsers(params?: PaginationParams): Promise<PaginatedData<User>> {
  const response = await client.get<PaginatedData<User>>('/Users', { params });
  return response.data;
}

export async function getUser(id: number): Promise<User> {
  const response = await client.get<User>(`/Users/${id}`);
  return response.data;
}

export async function updateUser(id: number, body: UpdateUserRequest): Promise<User> {
  const response = await client.put<User>(`/Users/${id}`, body);
  return response.data;
}

export async function patchUserActive(id: number, active: boolean): Promise<void> {
  await client.patch(`/Users/${id}/active`, { active });
}

export async function deleteUser(id: number): Promise<void> {
  await client.delete(`/Users/${id}`);
}

export async function listRoles(): Promise<PaginatedData<Role>> {
  const response = await client.get<PaginatedData<Role>>('/Roles', { params: { pageSize: 50 } });
  return response.data;
}

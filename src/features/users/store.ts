import { create } from 'zustand';
import { usersApi, rolesApi, type UpdateUserRequest } from '@/api/endpoints/users';
import type { PaginatedData, PaginationParams } from '@/api/types';
import type { User, Role } from '@/types/models';

interface UserStore {
  data: PaginatedData<User> | null;
  detail: User | null;
  roles: Role[];
  isLoading: boolean;
  isLoadingDetail: boolean;
  isLoadingRoles: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  isPatching: boolean;
  _params: PaginationParams;

  fetch: (params?: PaginationParams) => Promise<void>;
  fetchDetail: (id: number) => Promise<void>;
  fetchRoles: () => Promise<void>;
  update: (id: number, body: UpdateUserRequest) => Promise<void>;
  delete: (id: number) => Promise<void>;
  patchActive: (id: number, active: boolean) => Promise<void>;
}

export const useUserStore = create<UserStore>((set, get) => ({
  data: null,
  detail: null,
  roles: [],
  isLoading: false,
  isLoadingDetail: false,
  isLoadingRoles: false,
  isSaving: false,
  isDeleting: false,
  isPatching: false,
  _params: {},

  async fetch(params = {}) {
    set({ isLoading: true, _params: params });
    try {
      const data = await usersApi.list(params);
      set({ data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  async fetchDetail(id) {
    set({ isLoadingDetail: true });
    try {
      const detail = await usersApi.get(id);
      set({ detail, isLoadingDetail: false });
    } catch (error) {
      set({ isLoadingDetail: false });
      throw error;
    }
  },

  async fetchRoles() {
    set({ isLoadingRoles: true });
    try {
      const result = await rolesApi.list();
      set({ roles: result.items, isLoadingRoles: false });
    } catch (error) {
      set({ isLoadingRoles: false });
      throw error;
    }
  },

  async update(id, body) {
    set({ isSaving: true });
    try {
      await usersApi.update(id, body);
      set({ isSaving: false });
      await get().fetch(get()._params);
    } catch (error) {
      set({ isSaving: false });
      throw error;
    }
  },

  async delete(id) {
    set({ isDeleting: true });
    try {
      await usersApi.delete(id);
      set({ isDeleting: false });
      await get().fetch(get()._params);
    } catch (error) {
      set({ isDeleting: false });
      throw error;
    }
  },

  async patchActive(id, active) {
    set({ isPatching: true });
    try {
      await usersApi.patchActive(id, active);
      set({ isPatching: false });
      await get().fetch(get()._params);
    } catch (error) {
      set({ isPatching: false });
      throw error;
    }
  },
}));

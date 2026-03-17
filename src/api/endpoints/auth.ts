import { client, getAccessToken } from '../client';

export interface AuthTokenResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
}

export const authApi = {
  login: async (data: LoginPayload): Promise<AuthTokenResponse> => {
    const response = await client.post<AuthTokenResponse>('/Auth/login', data);
    return response.data;
  },

  refresh: async (refreshToken: string): Promise<AuthTokenResponse> => {
    const response = await client.post<AuthTokenResponse>('/Auth/refresh', {
      token: getAccessToken() ?? '',
      refreshToken,
    });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await client.post('/Auth/logout');
  },

  register: async (data: RegisterPayload): Promise<void> => {
    await client.post('/Auth/register', data);
  },
};

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

export async function login(data: LoginPayload): Promise<AuthTokenResponse> {
  const response = await client.post<AuthTokenResponse>('/Auth/login', data);
  return response.data;
}

export async function refreshToken(token: string): Promise<AuthTokenResponse> {
  const response = await client.post<AuthTokenResponse>('/Auth/refresh', {
    token: getAccessToken() ?? '',
    refreshToken: token,
  });
  return response.data;
}

export async function logout(): Promise<void> {
  await client.post('/Auth/logout');
}

export async function register(data: RegisterPayload): Promise<void> {
  await client.post('/Auth/register', data);
}

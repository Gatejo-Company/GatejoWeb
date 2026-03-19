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

export class AuthApi {
  static async login(data: LoginPayload): Promise<AuthTokenResponse> {
    const response = await client.post<AuthTokenResponse>('/Auth/login', data);
    return response.data;
  }

  static async refresh(token: string): Promise<AuthTokenResponse> {
    const response = await client.post<AuthTokenResponse>('/Auth/refresh', {
      token: getAccessToken() ?? '',
      refreshToken: token,
    });
    return response.data;
  }

  static async logout(): Promise<void> {
    await client.post('/Auth/logout');
  }

  static async register(data: RegisterPayload): Promise<void> {
    await client.post('/Auth/register', data);
  }
}

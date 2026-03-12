export type Role = 'Admin' | 'User';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
}

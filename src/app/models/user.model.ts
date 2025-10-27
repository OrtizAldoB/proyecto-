export type UserRole = 'admin' | 'agent' | 'client';

export interface User {
  username: string;
  password: string;
  role: UserRole;
}

export const MOCK_USERS: User[] = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'agent', password: 'agent123', role: 'agent' },
  { username: 'client', password: 'client123', role: 'client' }
];

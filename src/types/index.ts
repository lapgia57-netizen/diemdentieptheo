export interface LocationItem {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  userId: string;
  userEmail: string;
  timestamp: number;
}

export interface AuthUser {
  uid: string;
  email: string | null;
}

export type AuthMode = 'login' | 'register';

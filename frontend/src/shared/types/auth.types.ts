export interface AuthUser {
  userId: number;
  name: string;
  userAccount: string;
  roleName: string;
}

export interface LoginResponse {
  token: string;
  expiration: string;
  userId: number;
  name: string;
  userAccount: string;
  roleId: number;
  roleName: string;
}

export interface LoginRequest {
  userAccount: string;
  password: string;
}

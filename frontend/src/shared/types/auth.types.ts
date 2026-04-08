export interface AuthUser {
  userId: number;
  userName: string;
  userAccount: string;
  roleName: string;
}

export interface LoginResponse {
  token: string;
  expiration: string;
  userId: number;
  userName: string;
  userAccount: string;
  roleName: string;
}

export interface LoginRequest {
  account: string;
  password: string;
}

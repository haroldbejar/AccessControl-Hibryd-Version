export interface UserResponse {
  id: number;
  userAccount: string;
  name: string;
  roleId: number;
  roleName: string;
  visible: boolean;
}

export interface RoleResponse {
  id: number;
  name: string;
  visible: boolean;
}

export interface CreateUserRequest {
  userAccount: string;
  password: string;
  name: string;
  roleId: number;
  userCreated: number;
}

export interface UpdateUserRequest {
  id: number;
  name: string;
  roleId: number;
  visible: boolean;
  userModified: number;
}

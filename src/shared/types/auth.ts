export type LoginRequest = {
  identity: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
  username: string;
  fullName: string;
  email: string | null;
  role: string;
  emailConfirmed: boolean;
  mustChangePassword: boolean;
  isActive: boolean;
};

export type AuthMeResponse = {
  userId: string;
  username: string;
  fullName: string;
  email: string | null;
  role: string;
  emailConfirmed: boolean;
  mustChangePassword: boolean;
  isActive: boolean;
};

export type AuthUser = AuthMeResponse;

export type ApiProblemDetails = {
  title?: string;
  detail?: string;
  status?: number;
};

export type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  login: (payload: LoginRequest) => Promise<string>;
  logout: () => Promise<void>;
};
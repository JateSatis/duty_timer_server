export type SignUpRequestBody = {
  login: string;
  password: string;
  name: string;
  nickname: string;
};

export type SignUpResponseBody = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
};

export type SignInRequestBody = {
  password: string;
  login: string;
};

export type SignInResponseBody = SignUpResponseBody;

export type RefreshTokenResponseBody = SignUpResponseBody;

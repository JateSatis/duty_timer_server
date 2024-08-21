//# --- SIGN UP REQUEST ---
export type SignUpRequestBody = {
  login: string;
  password: string;
  name: string;
  nickname: string;
};
export const signUpRequestBodyProperties = [
  "login",
  "password",
  "name",
  "nickname",
];

//# --- SIGN UP RESPONSE ---
export type SignUpResponseBody = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
};

//# --- SIGN IN REQUEST ---
export type SignInRequestBody = {
  login: string;
  password: string;
};
export const signInRequestBodyProperties = ["login", "password"];

//# --- SIGN IN RESPONSE ---
export type SignInResponseBody = SignUpResponseBody;

//# --- REFRESH TOKEN RESPONSE ---
export type RefreshTokenResponseBody = SignUpResponseBody;

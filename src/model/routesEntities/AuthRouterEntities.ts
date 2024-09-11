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

//# --- VERFIY EMAIL REQUEST ---
export type VerifyEmailRequestBody = {
  email: string;
  otp: number;
};

//# --- VERIFY EMAIL RESPONSE ---
export type VerifyEmailResponseBody = {
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
export type TokenData = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
};

export type SignInResponseBody = {
  status: "success" | "email_verification_needed";
  data: TokenData | null;
};

//# --- REFRESH TOKEN RESPONSE ---
export type RefreshTokenResponseBody = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
};

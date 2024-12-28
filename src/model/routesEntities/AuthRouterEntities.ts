import { UserType } from "@prisma/client";

//# --- SIGN UP REQUEST ---
export type SignUpRequestBody = {
  login: string;
  password: string;
  nickname: string;
  userType: UserType;
};
export const signUpRequestBodyProperties = [
  "login",
  "password",
  "nickname",
  "userType",
];

//# --- SEND VERIFICATION OTP ---
export type ResendVerificationOtpRequestBody = {
  email: string;
};

export const resendVerificationOtpRequestBodyProperties = ["email"];

//# --- VERIFIY EMAIL REQUEST ---
export type VerifyEmailRequestBody = {
  email: string;
  otp: number;
};

export const verifyEmailRequestBodyProperties = ["email", "otp"];

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

export type SignInResponseBody = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
};

//# --- REFRESH TOKEN RESPONSE ---
export type RefreshTokenResponseBody = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
};

//# --- SIGN UP REQUEST ---
export type SignUpRequestBody = {
  login: string;
  password: string;
  nickname: string;
};
export const signUpRequestBodyProperties = ["login", "password", "nickname"];

//# --- SEND VERIFICATION OTP ---
export type SendVerificationOtpRequestBody = {
  email: string;
};

export const sendVerificationOtpRequestBodyProperties = ["email"];

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

//# --- SEND PASSWORD RESET OTP ---
export type SendPasswordResetOtpRequestBody = {
  email: string;
};

export const sendPasswordResetOtpRequestBodyProperties = ["email"];

//# --- VERIFY PASSWORD RESET ---
export type VerifyPasswordResetRequestBody = {
  email: string;
  otp: number;
};

export const verifyPasswordResetRequestBodyProperties = ["email", "otp"];

//# --- RESET PASSWORD ---
export type ResetPasswordRequestBody = {
  email: string;
  password: string;
};

export const resetPasswordRequestBodyProperties = ["email", "password"];

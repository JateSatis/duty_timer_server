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

//# --- VERIFY PASSWORD RESET ---
export type VerifyPasswordResetRequestBody = {
  otp: number;
};

export const verifyPasswordResetRequestBodyProperties = ["otp"];

//# --- RESET PASSWORD ---
export type ResetPasswordRequestBody = {
  password: string;
};

export const resetPasswordRequestBodyProperties = ["password"];

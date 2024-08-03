export type SignUpRequestBody = {
  login: string;
  password: string;
  name: string;
  nickname: string;
}

export type SignUpResponseBody = {
  token: string;
  expiresIn: string;
};

export type SignInRequestBody = {
  password: string;
  login: string;
};

export type SignInResponseBody = {
  token: string;
  expiresIn: string;
};

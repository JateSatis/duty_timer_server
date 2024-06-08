class SignUpRequestBody {
  login: String;
  password: String;
  name: String;
  nickname: String;
}

class SignUpResponseBody {
  token: String;
  expiresIn: String;
}

class SignInRequestBody {
	password: String;
	login: String
}

class SignInResponseBody extends SignUpResponseBody {}

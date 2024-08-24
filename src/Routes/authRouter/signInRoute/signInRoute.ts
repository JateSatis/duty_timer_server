//# --- Libs ---
import { Request, Response } from "express";

//# --- Auth ---
import {
  issueAccessToken,
  issueRefreshToken,
} from "../../../auth/jwt/issueJWT";
import { validatePassword } from "../../../auth/jwt/passwordHandler";

//# --- Config
import { DB, dutyTimerDataSource } from "../../../model/config/initializeConfig";

//# --- Request entities ---
import {
  SignInRequestBody,
  signInRequestBodyProperties,
  SignInResponseBody,
} from "../../../model/routesEntities/AuthRouterEntities";

//# --- Database entities ---
import { RefreshToken } from "../../../model/database/RefreshToken";
import { User } from "../../../model/database/User";

//# --- Validate request ---
import { missingRequestField } from "../../utils/validation/missingRequestField";
import { invalidInputFormat } from "./invalidInputFormat";
import { emptyField } from "../../utils/validation/emptyField";

//# --- ERRORS ---
import { err } from "../../utils/errors/GlobalErrors";
import {
  INCORRECT_PASSWORD,
  NON_EXISTANT_USER,
} from "../../utils/errors/AuthErrors";
import { DATABASE_ERROR } from "../../utils/errors/GlobalErrors";

export const signInRoute = async (req: Request, res: Response) => {
  if (missingRequestField(req, res, signInRequestBodyProperties)) return res;

  if (emptyField(req, res, signInRequestBodyProperties)) return res;
  const signInRequestBody: SignInRequestBody = req.body;

  if (invalidInputFormat(res, signInRequestBody)) return res;

  let user: User | null;
  try {
		user = await DB.getUserByLogin(signInRequestBody.login);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error.message)));
  }

  if (!user) {
    return res
      .status(400)
      .json(err(new NON_EXISTANT_USER("login", signInRequestBody.login)));
  }

  const passwordIsValid = validatePassword(
    signInRequestBody.password,
    user.passwordHash,
    user.passwordSalt
  );

  if (!passwordIsValid)
    return res.status(400).json(err(new INCORRECT_PASSWORD()));

  const accessToken = issueAccessToken(user.id);
  const refreshToken = issueRefreshToken(user.id);

  const refreshTokenId = user.refreshToken.id;

  try {
    await RefreshToken.update(refreshTokenId, {
      token: refreshToken.token,
      isRevoked: false,
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error.message)));
  }

  const signInResponseBody: SignInResponseBody = {
    accessToken: accessToken.token,
    accessTokenExpiresAt: accessToken.expiresAt,
    refreshToken: refreshToken.token,
    refreshTokenExpiresAt: refreshToken.expiresAt,
  };

  return res.status(200).json(signInResponseBody);
};

//# --- Libs ---
import { Request, Response } from "express";

//# --- Auth ---
import {
  issueAccessToken,
  issueRefreshToken,
} from "../../../auth/jwt/issueJWT";
import { validatePassword } from "../../../auth/jwt/passwordHandler";

//# --- Config
import { dutyTimerDataSource } from "../../../model/config/initializeConfig";

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
import { invalidRequest } from "../../../Routes/utils/validateRequest";
import { invalidInputFormat } from "./invalidInputFormat";
import { emptyField } from "./emptyFields";

export const signInRoute = async (req: Request, res: Response) => {
  if (invalidRequest(req, res, signInRequestBodyProperties)) return res;

  const signInRequestBody: SignInRequestBody = req.body;
  if (emptyField(res, signInRequestBody)) return res;

  if (invalidInputFormat(res, signInRequestBody)) return res;

  const user = await dutyTimerDataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.refreshToken", "refreshToken")
    .where("user.login = :login", { login: signInRequestBody.login })
    .getOne();

  if (!user) {
    return res.status(400).json({
      message: "There is no user with corresponding login",
    });
  }

  const passwordIsValid = validatePassword(
    signInRequestBody.password,
    user.passwordHash,
    user.passwordSalt
  );

  if (!passwordIsValid) {
    return res.status(400).json({
      message: "Incorrect password",
    });
  }

  const accessToken = issueAccessToken(user);
  const refreshToken = issueRefreshToken(user);

  const refreshTokenId = user.refreshToken.id;

  await RefreshToken.update(refreshTokenId, {
    token: refreshToken.token,
    isRevoked: false,
  });

  const signInResponseBody: SignInResponseBody = {
    accessToken: accessToken.token,
    accessTokenExpiresAt: accessToken.expiresAt,
    refreshToken: refreshToken.token,
    refreshTokenExpiresAt: refreshToken.expiresAt,
  };

  return res.status(200).json(signInResponseBody);
};

//# --- LIBS ---
import { Request, Response } from "express";

//# --- AUTH ---
import { generatePasswordHash } from "../../../auth/jwt/passwordHandler";
import {
  issueAccessToken,
  issueRefreshToken,
} from "../../../auth/jwt/issueJWT";

//# --- VALIDATE REQUEST ---
import { missingRequestField } from "../../utils/validation/missingRequestField";
import { nicknameIsTaken } from "./nicknameIsTaken";
import { accountAlreadyExists } from "./accountAlreadyExists";
import { invalidInputFormat } from "./invalidInputFormat";

//# --- REQUEST ENTITIES ---
import {
  SignUpRequestBody,
  signUpRequestBodyProperties,
  SignUpResponseBody,
} from "../../../model/routesEntities/AuthRouterEntities";

//# --- DATABASE ENTITIES ---
import { User } from "../../../model/database/User";
import { Timer } from "../../../model/database/Timer";
import { RefreshToken } from "../../../model/database/RefreshToken";
import { emptyField } from "../../../Routes/utils/validation/emptyField";

//# --- ERRORS ---
import { err } from "../../utils/errors/GlobalErrors";
import { DATABASE_ERROR } from "../../utils/errors/GlobalErrors";

// TODO: Connect to the Global chat when initializing user

export const signUpRoute = async (req: Request, res: Response) => {
  //# Check if all fields of json object are present in request
  if (missingRequestField(req, res, signUpRequestBodyProperties)) return res;

  //# Check if all sign up fields are filled and not empty
  if (emptyField(req, res, signUpRequestBodyProperties)) return res;
  const signUpRequestBody: SignUpRequestBody = req.body;

  //# Check if all sign up fields satisfy the format requirements
  if (invalidInputFormat(res, signUpRequestBody)) return res;

  //# Check if nickname provided is already in use
  if (await nicknameIsTaken(res, signUpRequestBody.nickname)) return res;

  //# Check if login provided already belongs to an existing account
  if (await accountAlreadyExists(res, signUpRequestBody.login)) return res;

  const passwordHash = generatePasswordHash(signUpRequestBody.password);

  const startTime = new Date();
  const endTime = new Date();
  endTime.setFullYear(startTime.getFullYear() + 1);

  const timer = Timer.create({
    startTimeMillis: startTime.getTime(),
    endTimeMillis: endTime.getTime(),
    users: [],
  });

  try {
    await timer.save();
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  const user = User.create({
    login: signUpRequestBody.login,
    name: signUpRequestBody.name,
    nickname: signUpRequestBody.nickname,
    passwordHash: passwordHash.hash,
    passwordSalt: passwordHash.salt,
    timer: timer,
  });

  try {
    await user.save();
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  const accessToken = issueAccessToken(user.id);
  const refreshToken = issueRefreshToken(user.id);

  const refreshTokenDB = RefreshToken.create({
    token: refreshToken.token,
    isRevoked: false,
    user,
  });

  try {
    await refreshTokenDB.save();
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  const signUpResponseBody: SignUpResponseBody = {
    accessToken: accessToken.token,
    accessTokenExpiresAt: accessToken.expiresAt,
    refreshToken: refreshToken.token,
    refreshTokenExpiresAt: refreshToken.expiresAt,
  };

  return res.status(200).json(signUpResponseBody);
};

//# --- Libs ---
import { Request, Response } from "express";

//# --- Auth ---
import { generatePasswordHash } from "../../../auth/jwt/passwordHandler";
import {
  issueAccessToken,
  issueRefreshToken,
} from "../../../auth/jwt/issueJWT";

//# --- Validate request ---
import { invalidRequest } from "../../utils/validateRequest";
import { emptyField } from "./emptyField";
import { nicknameIsTaken } from "./nicknameIsTaken";
import { accountAlreadyExists } from "./accountAlreadyExists";
import { invalidInputFormat } from "./invalidInputFormat";

//# --- Request entities ---
import {
  SignUpRequestBody,
  signUpRequestBodyProperties,
  SignUpResponseBody,
} from "../../../model/routesEntities/AuthRouterEntities";

//# --- Database entities ---
import { User } from "../../../model/database/User";
import { Timer } from "../../../model/database/Timer";
import { RefreshToken } from "../../../model/database/RefreshToken";

// TODO: Catch errors when working with DB
// TODO: Connect to the Global chat when initializing user

export const signUpRoute = async (req: Request, res: Response) => {
  //# Check if all fields of json object are present in request
  if (invalidRequest(req, res, signUpRequestBodyProperties)) return res;

	const signUpRequestBody: SignUpRequestBody = req.body;
	//# Check if all sign up fields are filled and not empty
  if (emptyField(res, signUpRequestBody)) return res;

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

  await timer.save();

  const user = User.create({
    login: signUpRequestBody.login,
    name: signUpRequestBody.name,
    nickname: signUpRequestBody.nickname,
    passwordHash: passwordHash.hash,
    passwordSalt: passwordHash.salt,
    timer: timer,
  });

  await user.save();

  const accessToken = issueAccessToken(user);
  const refreshToken = issueRefreshToken(user);

  const refreshTokenDB = RefreshToken.create({
    token: refreshToken.token,
    isRevoked: false,
    user,
  });

  await refreshTokenDB.save();

  const signUpResponseBody: SignUpResponseBody = {
    accessToken: accessToken.token,
    accessTokenExpiresAt: accessToken.expiresAt,
    refreshToken: refreshToken.token,
    refreshTokenExpiresAt: refreshToken.expiresAt,
  };

  return res.status(200).json(signUpResponseBody);
};

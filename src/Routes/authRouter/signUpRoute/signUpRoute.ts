//# --- LIBS ---
import { Request, Response } from "express";

//# --- AUTH ---
import { generatePasswordHash } from "../../../auth/jwt/passwordHandler";

//# --- VALIDATE REQUEST ---
import { missingRequestField } from "../../utils/validation/missingRequestField";
import { nicknameIsTaken } from "./nicknameIsTaken";
import { accountAlreadyExists } from "./accountAlreadyExists";
import { invalidInputFormat } from "./invalidInputFormat";

//# --- REQUEST ENTITIES ---
import {
  SignUpRequestBody,
  signUpRequestBodyProperties,
} from "../../../model/routesEntities/AuthRouterEntities";

//# --- VERIFY REQUEST ---
import { emptyField } from "../../../Routes/utils/validation/emptyField";

//# --- ERRORS ---
import { err } from "../../utils/errors/GlobalErrors";
import { DATABASE_ERROR } from "../../utils/errors/GlobalErrors";
import { sendOtpVerification } from "../sendOtpVerification";
import {
  issueAccessToken,
  issueRefreshToken,
} from "../../../auth/jwt/issueJWT";
import { prisma } from "../../../model/config/prismaClient";

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

  const password = generatePasswordHash(signUpRequestBody.password);

	const startTime = new Date();
	const endTime = new Date();
	endTime.setFullYear(startTime.getFullYear() + 1);

  let user = await prisma.user.create({});

  let timer = await prisma.timer.create({
    data: {
      userId: user.id,
      startTimeMillis: startTime.getTime(),
      endTimeMillis: endTime.getTime(),
    },
  });

  let settings = await prisma.settings.create({
      data: {
        userId: user.id,
      },
    });

  let accountInfo = await prisma.accountInfo.create({
      data: {
        userId: user.id,
        verificationExpiresAt: Date.now(),
        email: signUpRequestBody.login,
        name: signUpRequestBody.name,
        nickname: signUpRequestBody.nickname,
        passwordHash: password.hash,
        passwordSalt: password.salt,
        userType: "DEFAULT",
        lastSeenOnline: Date.now(),
      },
    });

  let subscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        expirationDate: Date.now(),
      },
    });


  await sendOtpVerification(signUpRequestBody.login, accountInfo);

  return res.sendStatus(200);
};

export const signUpTestRoute = async (req: Request, res: Response) => {
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

  const password = generatePasswordHash(signUpRequestBody.password);

  let user;
  try {
    user = await prisma.user.create({});
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  const startTime = new Date();
  const endTime = new Date();
  endTime.setFullYear(startTime.getFullYear() + 1);

  let accountInfo;
  try {
    accountInfo = await prisma.accountInfo.create({
      data: {
        userId: user.id,
        email: signUpRequestBody.login,
        name: signUpRequestBody.name,
        nickname: signUpRequestBody.nickname,
        passwordHash: password.hash,
        passwordSalt: password.salt,
        verificationExpiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
        lastSeenOnline: Date.now(),
        isOnline: true,
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  let timer;
  try {
    timer = await prisma.timer.create({
      data: {
        userId: user.id,
        startTimeMillis: startTime.getTime(),
        endTimeMillis: endTime.getTime(),
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  let settings;
  try {
    settings = await prisma.settings.create({
      data: {
        userId: user.id,
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  let subscription;
  try {
    subscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        expirationDate: Date.now(),
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  const accessToken = issueAccessToken(user.id);
  const refreshToken = issueRefreshToken(user.id);

  try {
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken.token,
        isRevoked: false,
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  return res.status(200).json({
    accessToken: accessToken.token,
    accessTokenExpiresAt: accessToken.expiresAt,
    refreshToken: refreshToken.token,
    refreshTokenExpiresAt: refreshToken.expiresAt,
  });
};

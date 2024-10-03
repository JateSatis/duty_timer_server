//# --- LIBS ---
import { Request, Response } from "express";
import { RcptOptions, SMTPClient } from "smtp-client";

//# --- AUTH ---
import { generatePasswordHash } from "../../../auth/jwt/passwordHandler";

//# --- DATABASE ---
import { prisma } from "../../../model/config/prismaClient";

//# --- REQUEST ENTITIES ---
import {
  SignUpRequestBody,
  signUpRequestBodyProperties,
} from "../../../model/routesEntities/AuthRouterEntities";

//# --- VALIDATE REQUEST ---
import { missingRequestField } from "../../utils/validation/missingRequestField";
import { nicknameIsTaken } from "./nicknameIsTaken";
import { accountAlreadyExists } from "./accountAlreadyExists";
import { invalidInputFormat } from "./invalidInputFormat";
import { emptyField } from "../../utils/validation/emptyField";

//# --- ERRORS ---
import { DATABASE_ERROR, err } from "../../utils/errors/GlobalErrors";
import { EMAIL_NOT_VALID } from "../../utils/errors/AuthErrors";

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

  try {
    let user = await prisma.user.create({
      data: {},
    });

    let accountInfo = await prisma.accountInfo.create({
      data: {
        userId: user.id,
        isVerified: false,
        email: signUpRequestBody.login,
        nickname: signUpRequestBody.nickname,
        passwordHash: password.hash,
        passwordSalt: password.salt,
        userType: "DEFAULT",
        lastSeenOnline: Date.now(),
      },
    });

    return res.sendStatus(200);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }
};

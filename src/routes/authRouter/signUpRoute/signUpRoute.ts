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
import {
  DATA_NOT_FOUND,
  DATABASE_ERROR,
  sendError,
  ServerError,
  UNKNOWN_ERROR,
} from "../../utils/errors/GlobalErrors";
import { generateOtp } from "../generateOtp";
import { sendEmail } from "../sendEmail";

//# Swagger описание SignUpRequestBody
/**
 * @swagger
 * components:
 *   schemas:
 *     signUpRequest:
 *       type: object
 *       properties:
 *         login:
 *           type: string
 *           descritption: Email, который пользователь ввел при регистрации
 *           example: default_user@gmail.com
 *         password:
 *           type: string
 *           description: Пароль, который пользователь ввел при регистрации
 *           example: 123456
 *         nickname:
 *           type: string
 *           description: Никнейм, которай пользователь ввел при регистрации
 *           example: soldat2004
 */
export const signUpRoute = async (req: Request, res: Response) => {
  //# Check if all fields of json object are present in request
  if (missingRequestField(req, res, signUpRequestBodyProperties)) return res;

  //# Check if all sign up fields are filled and not empty
  if (emptyField(req, res, signUpRequestBodyProperties)) return res;
  const signUpRequestBody: SignUpRequestBody = req.body;

  //# Check if all sign up fields satisfy the format requirements
  if (invalidInputFormat(res, signUpRequestBody)) return res;

  //# Check if login provided already belongs to an existing account
  if (await accountAlreadyExists(res, signUpRequestBody.login)) return res;

  //# Check if nickname provided is already in use
  if (await nicknameIsTaken(res, signUpRequestBody.nickname)) return res;

  const otp = generateOtp();
  console.log(otp.value);

  let existingPendingUser = null;
  try {
    existingPendingUser = await prisma.pendingUser.findFirst({
      where: {
        email: {
          contains: signUpRequestBody.login,
          mode: "insensitive",
        },
      },
      include: {
        otpCode: true,
      },
    });
  } catch (error) {
    return sendError(res, new DATABASE_ERROR(error));
  }

  //# If this is a totally new user, we send email and create a pending user object for him
  if (!existingPendingUser || !existingPendingUser.otpCode) {
    const password = generatePasswordHash(signUpRequestBody.password);

    try {
      await sendEmail(signUpRequestBody.login, otp.value);
    } catch (error) {
      if (error instanceof ServerError) {
        return sendError(res, error);
      } else {
        return sendError(res, new UNKNOWN_ERROR(error));
      }
    }

    try {
      const pendingUser = await prisma.pendingUser.create({
        data: {
          email: signUpRequestBody.login,
          passwordHash: password.hash,
          passwordSalt: password.salt,
          nickname: signUpRequestBody.nickname,
          userCreatedAt: otp.createdAt,
        },
      });

      const otpCode = await prisma.otpCode.create({
        data: {
          otpHash: otp.hash,
          otpSalt: otp.salt,
          otpCreatedAt: otp.createdAt,
          otpExpiresAt: otp.expiresAt,
          purpose: "REGISTRATION",
          pendingUserId: pendingUser.id,
        },
      });
    } catch (err) {
      const error = new DATABASE_ERROR(err);
      return res.status(error.code).json(error.toString());
    }

    return res.sendStatus(200);
  }

  // TODO: Check if password and nickname are the same here as when he first signed up
  //# If pendingUser already exists
  const currentTime = BigInt(Date.now());
  const oneMinute = BigInt(60 * 1000);
  //# If one minute has passed from sending the otp, we can send a new one
  if (existingPendingUser.otpCode.otpCreatedAt + oneMinute > currentTime) {
    try {
      await sendEmail(signUpRequestBody.login, otp.value);
    } catch (err) {
      if (err instanceof ServerError) {
        return res.status(err.code).json(err.toString());
      } else {
        const error = new UNKNOWN_ERROR(err);
        return res.status(error.code).json(error.toString());
      }
    }

    try {
      await prisma.pendingUser.update({
        where: {
          id: existingPendingUser.id,
				},
        data: {
          otpCode: {
            update: {
              otpHash: otp.hash,
              otpSalt: otp.salt,
              otpCreatedAt: otp.createdAt,
              otpExpiresAt: otp.expiresAt,
            },
          },
        },
      });
    } catch (err) {
      const error = new DATABASE_ERROR(err);
      return res.status(error.code).json(error.toString());
    }

    return res.sendStatus(200);
  }

  //# If one minute hasn't passed yet, we just return success
  return res.sendStatus(200);
};

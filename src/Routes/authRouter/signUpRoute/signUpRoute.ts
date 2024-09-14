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

//# --- DATABASE ENTITIES ---
import { User } from "../../../model/database/User";
import { Timer } from "../../../model/database/Timer";
import { Settings } from "../../../model/database/Settings";

//# --- VERIFY REQUEST ---
import { emptyField } from "../../../Routes/utils/validation/emptyField";

//# --- ERRORS ---
import { err } from "../../utils/errors/GlobalErrors";
import { DATABASE_ERROR } from "../../utils/errors/GlobalErrors";
import { sendOtpVerification } from "../sendOtpVerification";

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

  const settings = Settings.create();

  try {
    await settings.save();
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
    settings: settings,
    isOnline: true,
    lastSeenOnline: Date.now(),
    verificationExpiresAt: Date.now(),
  });

  try {
    await user.save();
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  await sendOtpVerification(user.login, user);

  return res.sendStatus(200);
};

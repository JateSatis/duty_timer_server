import { Router } from "express";
import { issueJWT } from "../auth/jwt/issueJWT";
import {
  generatePasswordHash,
  validatePassword,
} from "../auth/jwt/passwordHandler";
import { User } from "../model/database/User";
import { requestBodyIsComplete } from "./utils/checkRequestBody";
import { auth } from "../auth/authMiddleware";
import { dutyTimerDataSource } from "../model/config/initializeConfig";
import { setStatus } from "./userRouter";
import { Timer } from "../model/database/Timer";
import {
  SignInRequestBody,
  SignInResponseBody,
  SignUpRequestBody,
  SignUpResponseBody,
} from "../model/routesEntities/AuthRouterEntities";

export const authRouter = Router();

authRouter.post("/sign-up", async (req, res) => {
  if (!requestBodyIsComplete(req, "login", "password", "name", "nickname")) {
    return res.status(400).json({
      message: "Not all properties provided",
    });
  }

  const signUpRequestBody: SignUpRequestBody = req.body;

  const verifyUser = await User.findOneBy({
    login: signUpRequestBody.login,
  });

  if (verifyUser) {
    return res.status(401).send("User is already registered. Try to login.");
  }

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
    password_hash: passwordHash.hash,
    passwordSalt: passwordHash.salt,
    timer: timer,
  });

  await user.save();

  const jwt = issueJWT(user);

  const signUpResponseBody: SignUpResponseBody = jwt;

  return res.status(200).json(signUpResponseBody);
});

authRouter.post("/sign-in", async (req, res) => {
  if (!requestBodyIsComplete(req, "password", "login")) {
    return res.status(400).json({
      message: "Not all properties provided",
    });
  }

  const signInRequestBody: SignInRequestBody = req.body;

  const user = await User.findOneBy({
    login: signInRequestBody.login,
  });

  if (!user) {
    return res.status(400).json({
      message: "There is no user with corresponding login",
    });
  }

  const passwordIsValid = validatePassword(
    signInRequestBody.password,
    user.password_hash,
    user.passwordSalt
  );

  if (!passwordIsValid) {
    return res.status(400).json({
      message: "Incorrect password",
    });
  }

  const jwt = issueJWT(user);

  const signInResponseBody: SignInResponseBody = jwt;

  return res.status(200).json(signInResponseBody);
});

authRouter.post("/log-out", auth, async (req, res) => {
  const jwt = req.body.jwt;
  const userId = jwt.sub;

  try {
    await setStatus(userId, false);
    return res.status(200);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

authRouter.delete("/", auth, async (req, res) => {
  const jwt = req.body.jwt;
  const userId = jwt.sub;

  const userRepository = dutyTimerDataSource.getRepository(User);

  await userRepository.delete({ id: userId });

  return res.status(200);
});

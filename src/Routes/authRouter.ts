import { Router } from "express";
import { issueAccessToken, issueRefreshToken } from "../auth/jwt/issueJWT";
import {
  generatePasswordHash,
  validatePassword,
} from "../auth/jwt/passwordHandler";
import { User } from "../model/database/User";
import { requestBodyIsComplete } from "./utils/checkRequestBody";
import { auth, refreshAuth } from "../auth/authMiddleware";
import { dutyTimerDataSource } from "../model/config/initializeConfig";
import { setStatus } from "./userRouter";
import { Timer } from "../model/database/Timer";
import { RefreshToken } from "../model/database/RefreshToken";
import {
  RefreshTokenResponseBody,
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
});

authRouter.post("/sign-in", async (req, res) => {
  if (!requestBodyIsComplete(req, "password", "login")) {
    return res.status(400).json({
      message: "Not all properties provided",
    });
  }

  const signInRequestBody: SignInRequestBody = req.body;

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
    user.password_hash,
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
});

authRouter.post("/log-out", auth, async (req, res) => {
  const userId = req.body.accessToken.sub;

  const user = await dutyTimerDataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.refreshToken", "refreshToken")
    .where("user.id = :userId", { userId })
    .getOne();

  if (!user) {
    return res.status(400).send(`There is no user with such id: ${userId}`);
  }

  const refreshToken = user.refreshToken;
  const refreshTokenRepoitory = dutyTimerDataSource.getRepository(RefreshToken);
  await refreshTokenRepoitory.update(refreshToken.id, { isRevoked: true });

  try {
    await setStatus(userId, false);
    return res.sendStatus(200);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

authRouter.delete("/", auth, async (req, res) => {
  const userId = req.body.accessToken.sub;

  const userRepository = dutyTimerDataSource.getRepository(User);

  await userRepository.delete({ id: userId });

  return res.sendStatus(200);
});

authRouter.get("/refresh-token", refreshAuth, async (req, res) => {
  const refreshToken = req.body.refreshToken;
  const userId = refreshToken.sub;

  const user = await dutyTimerDataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.refreshToken", "refreshToken")
    .where("user.id = :userId", { userId })
    .getOne();

  if (!user) {
    return res.status(400).send(`There is no user with such id: ${userId}`);
  }

  const refreshTokenDB = user.refreshToken;

  if (refreshTokenDB.isRevoked || user.refreshToken.token !== refreshToken) {
    return res
      .status(401)
      .send(
        "The refresh token of this user is revoked or is does not belong to him"
      );
  }

  const newAccessToken = issueAccessToken(user);
  const newRefreshToken = issueRefreshToken(user);

  await RefreshToken.update(user.refreshToken.id, {
    token: newRefreshToken.token,
    isRevoked: false,
  });

  const refreshTokenResponseBody: RefreshTokenResponseBody = {
    accessToken: newAccessToken.token,
    accessTokenExpiresAt: newAccessToken.expiresAt,
    refreshToken: newRefreshToken.token,
    refreshTokenExpiresAt: newRefreshToken.expiresAt,
  };

  return res.status(200).json(refreshTokenResponseBody);
});

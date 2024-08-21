import { Router } from "express";
import { issueAccessToken, issueRefreshToken } from "../../auth/jwt/issueJWT";
import { validatePassword } from "../../auth/jwt/passwordHandler";
import { User } from "../../model/database/User";
import { invalidRequest } from "../utils/validateRequest";
import { auth, refreshAuth } from "../../auth/authMiddleware";
import { dutyTimerDataSource } from "../../model/config/initializeConfig";
import { setStatus } from "../userRouter";
import { RefreshToken } from "../../model/database/RefreshToken";
import {
  RefreshTokenResponseBody,
  SignInRequestBody,
  signInRequestBodyProperties,
  SignInResponseBody,
  SignUpRequestBody,
  signUpRequestBodyProperties,
  SignUpResponseBody,
} from "../../model/routesEntities/AuthRouterEntities";
import { signUpRoute } from "./signUpRoute/signUpRoute";

export const authRouter = Router();

authRouter.post("/sign-up", signUpRoute);

authRouter.post("/sign-in", async (req, res) => {
  if (!invalidRequest(req, res, signInRequestBodyProperties)) return res;

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

  if (refreshTokenDB.isRevoked) {
    return res.status(401).send("The refresh token of this user is revoked");
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

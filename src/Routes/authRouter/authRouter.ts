import { Router } from "express";
import { issueAccessToken, issueRefreshToken } from "../../auth/jwt/issueJWT";
import { User } from "../../model/database/User";
import { auth } from "../../auth/authMiddleware";
import { refreshAuth } from "../../auth/refreshAuthMiddleware";
import { dutyTimerDataSource } from "../../model/config/initializeConfig";
import { RefreshToken } from "../../model/database/RefreshToken";
import {
  RefreshTokenResponseBody,
} from "../../model/routesEntities/AuthRouterEntities";
import { signUpRoute } from "./signUpRoute/signUpRoute";
import { signInRoute } from "./signInRoute/signInRoute";
import { logOutRoute } from "./logOutRoute/logOutRoute";

export const authRouter = Router();

authRouter.post("/sign-up", signUpRoute);

authRouter.post("/sign-in", signInRoute);

authRouter.post("/log-out", auth, logOutRoute);

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

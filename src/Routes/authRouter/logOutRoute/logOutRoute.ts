//# --- Libs ---
import { Request, Response } from "express";

//# --- Config ---
import { dutyTimerDataSource } from "../../../model/config/initializeConfig";
import { setStatus } from "../../../Routes/userRouter";

//# --- Database entities ---
import { RefreshToken } from "../../../model/database/RefreshToken";
import { User } from "../../../model/database/User";

export const logOutRoute = async (req: Request, res: Response) => {
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
};

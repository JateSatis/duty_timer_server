import { Router } from "express";
import { auth } from "../auth/authMiddleware";
import { User } from "../model/database/User";
import { dutyTimerDataSource } from "../model/config/initializeConfig";
import {
  GetForeignUserInfoResponseBody,
  GetUserInfoResponseBody,
} from "src/model/routesEntities/UserRouterEntities";

// TODO: Use request and response entities in every route

export const userRouter = Router();

userRouter.get("/", auth, async (req, res) => {
  const jwt = req.body.jwt;

  const userId = jwt.sub;

  const user = await User.findOneBy({
    id: userId,
  });

  if (!user) {
    return res.status(400).send(`There is no user with such id: ${userId}`);
  }

  const getUserInfoResponseBody: GetUserInfoResponseBody = user;

  return res.status(200).json(getUserInfoResponseBody);
});

userRouter.put("/set-status-online", auth, async (req, res) => {
  const jwt = req.body.jwt;

  const userId = jwt.sub;

  try {
    await setStatus(userId, true);
    return res.sendStatus(200);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

userRouter.put("/set-status-offline", auth, async (req, res) => {
  const jwt = req.body.jwt;

  const userId = jwt.sub;

  try {
    await setStatus(userId, false);
    return res.sendStatus(200);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

userRouter.get("/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);

  const user = await dutyTimerDataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .select(["user.id", "user.name", "user.nickname", "user.avatar_link"])
    .where("user.id = :userId", { userId })
    .getOne();

  if (!user) {
    return res.status(400).send(`There is no user with such id: ${userId}`);
  }

  const getForeignUserInfoResponseBody: GetForeignUserInfoResponseBody = user;

  return res.status(200).json(getForeignUserInfoResponseBody);
});

export const setStatus = async (userId: number, status: boolean) => {
  const userRepository = dutyTimerDataSource.getRepository(User);

  await userRepository.update(userId, { online: status });
};

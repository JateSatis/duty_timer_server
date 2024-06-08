import { Router } from "express";
import { auth } from "../auth/authMiddleware";
import { User } from "../model/User";
import { dutyTimerDataSource } from "../model/config/initializeConfig";

export const userRouter = Router();

userRouter.get("/", auth, async (req, res) => {
  const jwt = req.body.jwt;

  const userId = jwt.sub;

  const user = await User.findOneBy({
    id: userId,
  });

  res.json({
    user,
  });
});

userRouter.put("/set_status_online", auth, async (req, res) => {
  const jwt = req.body.jwt;

  const userId = jwt.sub;

  try {
    await setStatus(userId, true);
    return res.status(200).send("Successful");
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

userRouter.put("/set_status_offline", auth, async (req, res) => {
  const jwt = req.body.jwt;

  const userId = jwt.sub;

  try {
    await setStatus(userId, false);
    return res.status(200).send("Successful");
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

userRouter.get("/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);

  const user = await dutyTimerDataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .select([
      "user.id",
      "user.name",
      "user.nickname",
      "user.avatar_link",
    ])
    .where("user.id = :userId", { userId })
    .getOne();

  res.json({
    user,
  });
});

export const setStatus = async (userId: number, status: boolean) => {
  const userRepository = dutyTimerDataSource.getRepository(User);

  await userRepository.update(userId, { online: status });
};

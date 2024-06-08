import { Router } from "express";
import { issueJWT } from "../auth/jwt/issueJWT";
import {
  generatePasswordHash,
  validatePassword,
} from "../auth/jwt/passwordHandler";
import { User } from "../model/User";
import { requestBodyIsComplete } from "./utils/checkRequestBody";
import { auth } from "../auth/authMiddleware";
import { dutyTimerDataSource } from "../model/config/initializeConfig";
import { setStatus } from "./userRoutes";
import { Timer } from "../model/Timer";

export const authRouter = Router();

authRouter.post("/sign-up", async (req, res) => {
  console.log("Hello");
  if (!requestBodyIsComplete(req, "login", "password", "name", "nickname")) {
    return res.status(400).json({
      message: "Not all properties provided",
    });
  }

  const { login, password, name, nickname } = req.body;

  const verifyUser = await User.findOneBy({
    login: login,
  });

  if (verifyUser) {
    return res.json({
      message: "User is already registered. Try to login.",
    });
  }

  const passwordHash = generatePasswordHash(password);

  const startTime = new Date();
  const endTime = new Date();
  endTime.setFullYear(startTime.getFullYear() + 1);

  const timer = Timer.create({
    start_time: startTime.getTime(),
    end_time: endTime.getTime(),
    users: [],
  });

  await timer.save();

  const user = User.create({
    login: login,
    name: name,
    nickname: nickname,
    password_hash: passwordHash.hash,
    password_salt: passwordHash.salt,
    timer: timer,
  });

  await user.save();

  const jwt = issueJWT(user);

  return res.status(200).json({
    token: jwt.token,
    expiresIn: jwt.expires,
  });
});

authRouter.post("/sign-in", async (req, res) => {
  if (!requestBodyIsComplete(req, "password", "login")) {
    return res.status(400).json({
      message: "Not all properties provided",
    });
  }

  const { password, login } = req.body;

  const user = await User.findOneBy({
    login: login,
  });

  if (!user) {
    return res.status(400).json({
      message: "There is no user with corresponding login",
    });
  }

  const passwordIsValid = validatePassword(
    password,
    user.password_hash,
    user.password_salt
  );

  if (!passwordIsValid) {
    return res.status(400).json({
      message: "Incorrect password",
    });
  }

  const jwt = issueJWT(user);

  return res.status(200).json({
    token: jwt.token,
    expiresIn: jwt.expires,
  });
});

authRouter.post("/log-out", auth, async (req, res) => {
  const jwt = req.body.jwt;
  const userId = jwt.sub;

  try {
    await setStatus(userId, false);
    return res.status(200);
  } catch (error) {
    return res.status(400);
  }
});

authRouter.delete("/", auth, async (req, res) => {
  const jwt = req.body.jwt;
  const userId = jwt.sub;

  const userRepository = dutyTimerDataSource.getRepository(User);

  await userRepository.delete({ id: userId });

  return res.status(200);
});

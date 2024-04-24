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

export const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  if (
    !requestBodyIsComplete(
      req,
      "login",
      "password",
      "name",
      "surname",
      "nickname"
    )
  ) {
    return res.status(400).json({
      message: "Not all properties provided",
    });
  }

  const { login, password, name, surname, nickname } = req.body;

  const verifyUser = await User.findOneBy({
    login: login,
  });

  if (verifyUser) {
    return res.json({
      message: "User is already registered. Try to login.",
    });
  }

  const passwordHash = generatePasswordHash(password);

  const user = User.create({
    login: login,
    name: name,
    surname: surname,
    nickname: nickname,
    password_hash: passwordHash.hash,
    password_salt: passwordHash.salt,
  });

  await user.save();

  const jwt = issueJWT(user);

  return res.status(200).json({
    success: true,
    user: user,
    token: jwt.token,
    expiresIn: jwt.expires,
  });
});

authRouter.post("/login", async (req, res) => {
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
    success: true,
    user: user,
    token: jwt.token,
    expiresIn: jwt.expires,
  });
});

authRouter.post("/logout", auth, async (req, res) => {
  const jwt = req.body.jwt;

  const userId = jwt.sub;

  try {
    await setStatus(userId, true);
    return res.status(200).send("Successful");
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

authRouter.delete("/", auth, async (req, res) => {
  const jwt = req.body.jwt;

  const userId = jwt.sub;

  const userRepository = dutyTimerDataSource.getRepository(User);

  await userRepository.delete({ id: userId });

  return res.status(200).send("Successful");
});

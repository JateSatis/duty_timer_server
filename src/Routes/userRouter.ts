import multer from "multer";
import { Router } from "express";
import { auth } from "../auth/authMiddleware";
import { User } from "../model/database/User";
import { dutyTimerDataSource } from "../model/config/initializeConfig";
import {
  GetAvatarLinkResponseBody,
  GetForeignUserInfoResponseBody,
  GetUserInfoResponseBody,
  GetUsersByNameResponseBody,
  UploadAvatarResponseBody,
} from "../model/routesEntities/UserRouterEntities";
import { S3DataSource } from "../model/config/imagesConfig";

export const userRouter = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// TODO: Catch errors when working with DB

userRouter.get("/", auth, async (req, res) => {
  const accessToken = req.body.accessToken;

  const userId = accessToken.sub;

  const user = await dutyTimerDataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .select([
      "user.login",
      "user.id",
      "user.name",
      "user.nickname",
      "user.avatarImageName",
      "user.userType",
      "user.online",
    ])
    .where("user.id = :userId", { userId })
    .getOne();

  if (!user) {
    return res.status(400).send(`There is no user with such id: ${userId}`);
  }

  const getUserInfoResponseBody: GetUserInfoResponseBody = user;

  return res.status(200).json(getUserInfoResponseBody);
});

userRouter.put("/set-status-online", auth, async (req, res) => {
  const accessToken = req.body.accessToken;

  const userId = accessToken.sub;

  try {
    await setStatus(userId, true);
    return res.sendStatus(200);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

userRouter.put("/set-status-offline", auth, async (req, res) => {
  const accessToken = req.body.accessToken;

  const userId = accessToken.sub;

  try {
    await setStatus(userId, false);
    return res.sendStatus(200);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

userRouter.get("/id/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);

  const user = await dutyTimerDataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .select(["user.id", "user.name", "user.nickname", "user.avatarImageName"])
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

userRouter.get("/name/:userName", auth, async (req, res) => {
  const userName = req.params.userName;

  const users = await dutyTimerDataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .select(["user.id", "user.name", "user.nickname", "user.avatarImageName"])
    .where("user.name = :userName", {
      userName: userName,
    })
    .getMany();

  const getUsersByNameResponseBody: GetUsersByNameResponseBody = users;

  return res.status(200).json(getUsersByNameResponseBody);
});

userRouter.post("/avatar", upload.single("image"), auth, async (req, res) => {
  const accessToken = req.body.accessToken;
  const userId = accessToken.sub;

  if (!req.file) {
    return res.status(400).send("No file provided to be uploaded");
  }

  const user = await User.findOneBy({
    id: userId,
  });

  if (!user) {
    return res.status(404).send(`There is no user with such id: ${userId}`);
  }

  const imageName = req.file?.originalname!!;
  const contentType = req.file?.mimetype!!;
  const body = req.file?.buffer!!;

  const s3DataSource = new S3DataSource();

  let s3ImageName;

  try {
    s3ImageName = await s3DataSource.uploadImageToS3(
      imageName,
      body,
      contentType
    );
  } catch (error) {
    return res.status(400).send(error.message);
  }

  await User.update(userId, { avatarImageName: s3ImageName });

  const avatarLink = await s3DataSource.getImageUrlFromS3(s3ImageName);

  const uploadAvatarResponseBody: UploadAvatarResponseBody = {
    avatarLink,
  };

  return res.status(200).json(uploadAvatarResponseBody);
});

userRouter.get("/avatar", auth, async (req, res) => {
	const accessToken = req.body.accessToken
	const userId = accessToken.sub

	const user = await User.findOneBy({
		id: userId
	})

	if (!user) {
		return res.status(404).send(`There is no user with such id: ${userId}`)
	}

  const avatarName = user.avatarImageName;

  const s3DataSource = new S3DataSource();
  const url = await s3DataSource.getImageUrlFromS3(avatarName);

  if (!url) {
    return res.status(404).send("Image not found");
  }

  const getAvatarLinkResponseBody: GetAvatarLinkResponseBody = {
    imageUrl: url,
  };

  return res.status(200).json(getAvatarLinkResponseBody);
});

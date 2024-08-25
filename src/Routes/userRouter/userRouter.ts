import multer from "multer";
import { Router } from "express";
import { auth } from "../../auth/authMiddleware";
import { User } from "../../model/database/User";
import { dutyTimerDataSource } from "../../model/config/initializeConfig";
import { GetAvatarLinkResponseBody } from "../../model/routesEntities/UserRouterEntities";
import { S3DataSource } from "../../model/config/imagesConfig";
import { getUserByIdRoute } from "./getUserByIdRoute/getUserByIdRoute";
import { getUserInfoRoute } from "./getUserInfoRoute/getUserInfoRoute";
import { setStatusOnlineRoute } from "./setStatusOnlineRoute.ts/setStatusOnlineRoute";
import { setStatusOfflineRoute } from "./setStatusOfflineRoute/setStatusOfflineRoute";
import { getUsersByNameRoute } from "./getUsersByNameRoute/getUsersByNameRoute";
import { postAvatarRoute } from "./postAvatarRoute/postAvatarRoute";

export const userRouter = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// TODO: Catch errors when working with DB

userRouter.get("/", auth, getUserInfoRoute);

userRouter.put("/set-status-online", auth, setStatusOnlineRoute);

userRouter.put("/set-status-offline", auth, setStatusOfflineRoute);

userRouter.get("/id/:userId", getUserByIdRoute);

userRouter.get("/name/:userName", auth, getUsersByNameRoute);

export const setStatus = async (userId: number, status: boolean) => {
  const userRepository = dutyTimerDataSource.getRepository(User);

  await userRepository.update(userId, { online: status });
};

userRouter.post("/avatar", upload.single("image"), auth, postAvatarRoute);

userRouter.get("/avatar", auth, async (req, res) => {
  const user = req.body.user;

  const avatarImageName = user.avatarImageName;

	if (!avatarImageName) {
		const getAvatarLinkResponseBody: GetAvatarLinkResponseBody = {
      imageUrl: null,
    };
    return res.status(404).json(getAvatarLinkResponseBody);
  }

  const s3DataSource = new S3DataSource();
  const url = await s3DataSource.getImageUrlFromS3(avatarImageName);

  if (!url) {
    return res.status(404).send("Image not found");
  }

  const getAvatarLinkResponseBody: GetAvatarLinkResponseBody = {
    imageUrl: url,
  };

  return res.status(200).json(getAvatarLinkResponseBody);
});

userRouter.delete("/avatar", auth, async (req, res) => {
  const user = req.body.user.id;

  const avatarImageName = user.avatarImageName;

  if (!avatarImageName) {
    return res
      .status(404)
      .send(`There us no avatar image for this user: ${user.id}`);
  }

  await dutyTimerDataSource
    .getRepository(User)
    .createQueryBuilder()
    .update()
    .set({ avatarImageName: () => "NULL" })
    .where("id = :id", { id: user.id })
    .execute();

  const s3DataSource = new S3DataSource();
  await s3DataSource.deleteImageFromS3(avatarImageName);

  return res.status(200).send();
});

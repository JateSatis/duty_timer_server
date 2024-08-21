import { Router } from "express";
import multer from "multer";
import { S3DataSource } from "../model/config/imagesConfig";
import { auth } from "../auth/authMiddleware";
import {
  UploadImageRequesBody,
  UploadImageResponseBody,
} from "../model/routesEntities/ImageRouterEntitites";
import { Attachment } from "../model/database/Attachment";
import { dutyTimerDataSource } from "../model/config/initializeConfig";
import { User } from "../model/database/User";

// TODO: Use request and response entities in every route

export const imageRouter = Router();

// TODO: Catch errors when working with DB

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// imageRouter.post("/upload", auth, upload.single("image"), async (req, res) => {
//   const accessToken = req.body.accessToken;
// 	const userId = accessToken.sub;

// 	const user = await User.findOneBy({
// 		id: userId
// 	})

// 	if (!user) {
// 		return res.status(404)
// 	}

//   if (!req.file) {
//     return res.status(400).send("No file provided to be uploaded");
//   }

//   const imageName = req.file.originalname;
//   const contentType = req.file.mimetype;
//   const body = req.file.buffer;

//   const s3DataSource = new S3DataSource();

//   let s3ImageName;

//   try {
//     s3ImageName = await s3DataSource.uploadImageToS3(
//       imageName,
//       body,
//       contentType
//     );
//   } catch (error) {
//     return res.status(400).send(error.message);
//   }

//   const uploadImageResponseBody: UploadImageResponseBody = image;

//   return res.status(200).json(uploadImageResponseBody);
// });

imageRouter.get("/url/:imageName", auth, async (req, res) => {
  const imageName = req.params.imageName;

  const s3DataSource = new S3DataSource();
  const url = await s3DataSource.getImageUrlFromS3(imageName);

  if (!url) {
    return res.status(404).send("Image not found");
  }

  return res.status(200).json({
    imageUrl: url,
  });
});

imageRouter.delete("/delete/:imageId", auth, async (req, res) => {
  const imageId = req.params.imageId;

  const image = await Attachment.findOneBy({
    id: parseInt(imageId),
  });

  if (!image) {
    return res.status(400).send("There is no image with such id");
  }

  const imageName = image.name;

  const s3DataSource = new S3DataSource();
  try {
    await s3DataSource.deleteImageFromS3(imageName);
  } catch (error) {
    return res.status(400).send(error.message);
  }

  try {
    await image.remove();
  } catch (error) {
    return res.status(400).send(error.message);
  }

  return res.sendStatus(200);
});

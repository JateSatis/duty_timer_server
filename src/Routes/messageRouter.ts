import multer from "multer";
import { Router } from "express";
import { Chat } from "../model/database/Chat";
import { User } from "../model/database/User";
import { Message } from "../model/database/Message";
import { CreateMessageResponseBody } from "../model/routesEntities/MessageRoutesEntities";
import { S3DataSource } from "../model/config/imagesConfig";
import { Image } from "../model/database/Image";
import { auth } from "../auth/authMiddleware";
import { chatsMap } from "../sockets/socketsConfig";
import { SendMessageRequestBody } from "../model/routesEntities/WebSocketRouterEntities";

export const messageRouter = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const s3DataSource = new S3DataSource();

messageRouter.post(
  "/create/:chatId",
  upload.array("images", 10),
  auth,
  async (req, res) => {
    const jwt = req.body.jwt;
    const senderId = jwt.sub;

    const chatId = parseInt(req.params.chatId);

    const files = req.files;
    const text = req.body.data;

    if (!files || (Array.isArray(files) && files.length === 0)) {
      return res.status(400).send("No files uploaded.");
    }

    //# If `files` is an object, flatten it to an array
    const filesArray = Array.isArray(files)
      ? files
      : Object.values(files).flat();
    const imageNames: string[] = [];

    try {
      await Promise.all(
        filesArray.map(async (file) => {
          const imageName = file.originalname;
          const contentType = file.mimetype;
          const body = file.buffer;

          const s3ImageName = await s3DataSource.uploadImageToS3(
            imageName,
            body,
            contentType
          );
          imageNames.push(s3ImageName);
        })
      );
    } catch (error) {
      return res.sendStatus(400).json({
        message: "Couldn't save images to S3 bucker",
        error: error.message,
      });
    }

    const chat = await Chat.findOneBy({
      id: chatId,
    });

    if (!chat) {
      return res.sendStatus(400).send("There is no chat with such id");
    }

    const sender = await User.findOneBy({
      id: senderId,
    });

    if (!sender) {
      return res.sendStatus(400).send("There is no sender with such id");
    }

    const message = Message.create({
      text: text,
      chat: chat,
      sender: sender,
      creationTime: new Date(),
    });

    try {
      await message.save();
    } catch (error) {
      return res.sendStatus(400).json({
        message: "Couldn't save message entity to DB",
        error: error.message,
      });
    }

    try {
      await Promise.all(
        imageNames.map(async (imageName) => {
          const image = Image.create({
            name: imageName,
            message: message,
          });
          await image.save();
        })
      );
    } catch (error) {
      return res.sendStatus(400).json({
        message: "Couldn't save image entities to DB",
        error: error.message,
      });
    }

    const chatSockets = chatsMap.get(chatId);
    const senderSocket = chatSockets?.find(
      (value) => value.user.id == senderId
    );

    if (chatSockets && senderSocket) {
      const socketMessage: SendMessageRequestBody = {
        messageId: `${message.id}`,
        chatId: `${chatId}`,
      };
      senderSocket.socket.emit("message", JSON.stringify(socketMessage));
    }

    const createMessageResponseBody: CreateMessageResponseBody = message;

    return res.status(200).json(createMessageResponseBody);
  }
);

import multer from "multer";
import { Router } from "express";
import { Chat } from "../model/database/Chat";
import { User } from "../model/database/User";
import { Message } from "../model/database/Message";
import { CreateMessageResponseBody } from "../model/routesEntities/MessageRoutesEntities";
import { S3DataSource } from "../model/config/imagesConfig";
import { Attachment } from "../model/database/Attachment";
import { auth } from "../auth/authMiddleware";
import { chatsMap } from "../sockets/socketsConfig";
import { SendMessageRequestBody } from "../model/routesEntities/WebSocketRouterEntities";
import { dutyTimerDataSource } from "../model/config/initializeConfig";

export const messageRouter = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const s3DataSource = new S3DataSource();

// TODO: Catch errors when working with DB

messageRouter.post(
  "/create/:chatId",
  upload.array("image", 10),
  auth,
  async (req, res) => {
    const accessToken = req.body.accessToken;
    const senderId = accessToken.sub;

    const chatId = parseInt(req.params.chatId);

    const files = req.files;
    const text = req.body.data;
    const imageNames: string[] = [];

    if (files !== undefined && Array.isArray(files) && files.length !== 0) {
      try {
        await Promise.all(
          files.map(async (file) => {
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
        return res.status(400).json({
          message: "Couldn't save images to S3 bucker",
          error: error.message,
        });
      }
    }

    const chat = await Chat.findOneBy({
      id: chatId,
    });

    if (!chat) {
      return res.status(400).send("There is no chat with such id");
    }

    const sender = await User.findOneBy({
      id: senderId,
    });

    if (!sender) {
      return res.status(400).send("There is no sender with such id");
    }

    const message = Message.create({
      text: text,
      chat: chat,
      sender: sender,
      creationTime: Date.now(),
    });

    try {
      await message.save();
    } catch (error) {
      return res.status(400).json({
        message: "Couldn't save message entity to DB",
        error: error.message,
      });
    }

    try {
      await Promise.all(
        imageNames.map(async (imageName) => {
          const attachment = Attachment.create({
            name: imageName,
            message: message,
          });
          await attachment.save();
        })
      );
    } catch (error) {
      return res.status(400).json({
        message: "Couldn't save image entities to DB",
        error: error.message,
      });
    }

    const chatSockets = chatsMap.get(chatId);
    const resultMessage = {
      id: message.id,
      chatId: chatId,
      text: message.text,
      creationTime: message.creationTime,
      senderName: sender.name,
      edited: message.edited,
      read: message.read,
      attachmentNames: imageNames,
    };

    if (chatSockets) {
      const senderSocket = chatSockets.find(
        (value) => value.user.id == senderId
      );

      if (senderSocket) {
        const socketMessage: SendMessageRequestBody = resultMessage
        senderSocket.socket.emit("message", JSON.stringify(socketMessage));
      }
    }

    const createMessageResponseBody: CreateMessageResponseBody = resultMessage;

    return res.status(200).json(createMessageResponseBody);
  }
);

messageRouter.delete("/delete-chat/:chatId", auth, async (req, res) => {
  const userId = req.body.accessToken.sub;
  const chatId = parseInt(req.params.chatId);

  const user = await dutyTimerDataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.chats", "chat")
    .where("user.id = :userId", { userId })
    .getOne();

  if (!user) {
    return res.status(404).send(`There is no user with such id: ${userId}`);
  }

  const userChatIds = user.chats.map((chat) => chat.id);
  if (userChatIds.includes(chatId)) {
    user.chats = user.chats.filter((chat) => chat.id !== chatId);
    await dutyTimerDataSource.getRepository(User).save(user);
  }

  return res.sendStatus(200);
});

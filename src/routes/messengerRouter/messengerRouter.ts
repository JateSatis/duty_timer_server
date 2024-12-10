//# --- LIBS ---
import { NextFunction, Request, Response, Router } from "express";
import rateLimit, { RateLimitExceededEventHandler } from "express-rate-limit";

//# --- AUTH ---
import { auth } from "../../auth/authMiddleware";

//# --- ROUTES ---
import { getAllChatsRoute } from "./getAllChatsRoute/getAllChatsRoute";
import { createMessageRoute } from "./createMessageRoute/createMessageRoute";
import { updateAllUnreadMessagesRoute } from "./updateAllUnreadMessagesRoute/updateAllUnreadMessagesRoute";
import { editMessageRoute } from "./editMessageRoute/editMessageRoute";
import { deleteMessageRoute } from "./deleteMessageRoute/deleteMessageRoute";
import { deleteChatRoute } from "./deleteChatRoute/deleteChatRoute";

///# --- UTILS ---
import { getFilesMiddleware } from "../utils/handleFiles/handleFilesMiddleware";
import { handleFile } from "../utils/handleFiles/handleFileMiddleware";
import { sendBackgroundImage } from "./sendBackgroundImage/sendBackgroundImage";
import { createGroupChat } from "./createGroupChat/createGroupChat";
import { getDirectChatInfo } from "./getDirectChatInfo/getDirectChatInfo";
import { getGroupChatInfo } from "./getGroupChatInfo/getGroupChatInfo";

//# --- ERRORS ---
import { err, RATE_LIMIT_EXCEEDED } from "../utils/errors/GlobalErrors";
import { getMessages } from "./getMessages/getMessages";
import { getGlobalChat } from "./getGlobalChat/getGlobalChat";

const rateLimitExceededHandler: RateLimitExceededEventHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return res.status(429).json(err(new RATE_LIMIT_EXCEEDED()));
};

const messengerLimiter = rateLimit({
  windowMs: 60 * 1000, // # One minite time
  limit: 120, // # User can send a request every 2 seconds basically
  handler: rateLimitExceededHandler,
  validate: {
    xForwardedForHeader: false,
  },
});

export const messengerRouter = Router();

messengerRouter.use(messengerLimiter);

//? Idea: make it so that attachments can also be edited when editing the message, so they can be
//? deleted or added new.

//# Swagger описание тега Messenger
/**
 * @swagger
 * tags:
 *   name: Messenger
 *   description: Ручки для мессенджера
 */

//# Swagger описание запроса getAllChatsRoute
/**
 * @swagger
 * /messenger/chats:
 *   get:
 *     summary: Получение списка всех чатов (кроме глобального)
 *     description: Используется для отображения экрана мессенджера
 *     tags: [Messenger]
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Список чатов успешно получен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/getAllChatsResponse'
 *       500:
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/DATABASE_ERROR'
 *                 - $ref: '#/components/schemas/S3_STORAGE_ERROR'
 *             examples:
 *               DATABASE_ERROR:
 *                 $ref: '#/components/examples/DATABASE_ERROR_EXAMPLE'
 *               S3_STORAGE_ERROR:
 *                 $ref: '#/components/examples/S3_STORAGE_ERROR_EXAMPLE'
 *           
 */
messengerRouter.get("/chats", auth, getAllChatsRoute);

//# Swagger описание запроса getDirectChatInfo
/**
 * @swagger
 * /messenger/direct-chat:
 *   get:
 *     summary: Получение информации о личном чате
 *     description: Используется для отображения названия и фото личного чата
 *     tags: [Messenger]
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - name: chatId
 *         description: UUID личного чата, чьи данные необходимо получить
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Данные чата успешно получены
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/getDirectChatInfoResponse'
 *       400:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EMPTY_PARAMETER'
 *       403:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FORBIDDEN_ACCESS'
 *       404:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DATA_NOT_FOUND'
 *       500:
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/DATABASE_ERROR'
 *                 - $ref: '#/components/schemas/S3_STORAGE_ERROR'
 *                 - $ref: '#/components/schemas/UNKNOWN_ERROR'
 *             examples:
 *               DATABASE_ERROR:
 *                 $ref: '#/components/examples/DATABASE_ERROR_EXAMPLE'
 *               S3_STORAGE_ERROR:
 *                 $ref: '#/components/examples/S3_STORAGE_ERROR_EXAMPLE'
 *               UNKNOWN_ERROR:
 *                 $ref: '#/components/examples/UNKNOWN_ERROR_EXAMPLE'
 *           
 */
messengerRouter.get("/direct-chat/:chatId", auth, getDirectChatInfo);

//# Swagger описание запроса getGroupChatInfo
/**
 * @swagger
 * /messenger/group-chat:
 *   get:
 *     summary: Получение списка всех чатов (кроме глобального)
 *     description: Используется для отображения экрана мессенджера
 *     tags: [Messenger]
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - name: chatId
 *         description: UUID группового чата, чьи данные необходимо получить
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Данные группового чата успешно получены
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/getDirectChatInfoResponse'
 *       400:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EMPTY_PARAMETER'
 *       403:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FORBIDDEN_ACCESS'
 *       404:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DATA_NOT_FOUND'
 *       500:
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/DATABASE_ERROR'
 *                 - $ref: '#/components/schemas/S3_STORAGE_ERROR'
 *             examples:
 *               DATABASE_ERROR:
 *                 $ref: '#/components/examples/DATABASE_ERROR_EXAMPLE'
 *               S3_STORAGE_ERROR:
 *                 $ref: '#/components/examples/S3_STORAGE_ERROR_EXAMPLE'
 *           
 */
messengerRouter.get("/group-chat/:chatId", auth, getGroupChatInfo);

messengerRouter.post(
  "/create/:chatId",
  getFilesMiddleware(10),
  auth,
  createMessageRoute
);

messengerRouter.post(
  "/update-all-unread-messages/:chatId",
  auth,
  updateAllUnreadMessagesRoute
);

messengerRouter.put("/edit-message/:messageId", auth, editMessageRoute);

messengerRouter.delete("/delete-message/:messageId", auth, deleteMessageRoute);

messengerRouter.post(
  "/create-group-chat",
  getFilesMiddleware(1),
  auth,
  createGroupChat
);

messengerRouter.delete("/delete-chat/:chatId", auth, deleteChatRoute);

messengerRouter.post(
  "/background-image/:recieverId",
  handleFile,
  auth,
  sendBackgroundImage
);

messengerRouter.get("/messages/:chatId", auth, getMessages);

messengerRouter.get("/global-chat", getGlobalChat);

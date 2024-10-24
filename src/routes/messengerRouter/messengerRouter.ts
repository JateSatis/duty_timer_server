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
  limit: 30, // # User can send a request every 2 seconds basically
  handler: rateLimitExceededHandler,
  validate: {
    xForwardedForHeader: false,
  },
});

export const messengerRouter = Router();

messengerRouter.use(messengerLimiter);

//? Idea: make it so that attachments can also be edited when editing the message, so they can be
//? deleted or added new.

//? Idea: add the "edited at" field to the message, so that when the message is edited,
//? it would be possible to display when it was done under the info about when it was created

messengerRouter.get("/chats", auth, getAllChatsRoute);

messengerRouter.get("/direct-chat/:chatId", auth, getDirectChatInfo);

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

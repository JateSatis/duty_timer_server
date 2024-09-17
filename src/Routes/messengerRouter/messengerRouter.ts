//# --- LIBS ---
import { Router } from "express";

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
import { handleFiles } from "./handleFilesMiddleware";
import { handleFile } from "../utils/validation/handleFileMiddleware";
import { sendBackgroundImage } from "./sendBackgroundImage/sendBackgroundImage";
import { createGroupChat } from "./createGroupChat/createGroupChat";
import { getDirectChatInfo } from "./getDirectChatInfo/getDirectChatInfo";
import { getGroupChatInfo } from "./getGroupChatInfo/getGroupChatInfo";

export const messengerRouter = Router();

//? Idea: make it so that attachments can also be edited when editing the message, so they can be
//? deleted or added new.

//? Idea: add the "edited at" field to the message, so that when the message is edited,
//? it would be possible to display when it was done under the info about when it was created

messengerRouter.get("/chats", auth, getAllChatsRoute);

messengerRouter.get("/direct-chat/:chatId", auth, getDirectChatInfo);

messengerRouter.get("/group-chat/:chatId", auth, getGroupChatInfo);

messengerRouter.post("/create/:chatId", handleFiles, auth, createMessageRoute);

messengerRouter.post(
  "/update-all-unread-messages/:chatId",
  auth,
  updateAllUnreadMessagesRoute
);

messengerRouter.put("/edit-message/:messageId", auth, editMessageRoute);

messengerRouter.delete("/delete-message/:messageId", auth, deleteMessageRoute);

messengerRouter.post("/create-group-chat", handleFile, auth, createGroupChat);

messengerRouter.delete("/delete-chat/:chatId", auth, deleteChatRoute);

messengerRouter.post(
  "/background-image/:recieverId",
  handleFile,
  auth,
  sendBackgroundImage
);

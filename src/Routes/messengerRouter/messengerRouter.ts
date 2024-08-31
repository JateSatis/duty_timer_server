//# --- LIBS ---
import { Router } from "express";

//# --- AUTH ---
import { auth } from "../../auth/authMiddleware";

//# --- ROUTES ---
import { getAllChatsRoute } from "./getAllChatsRoute/getAllChatsRoute";
import { getMessagesFromChatRoute } from "./getMessagesFromChatRoute/getMessagesFromChatRoute";
import { createMessageRoute } from "./createMessageRoute/createMessageRoute";
import { updateUnreadMessagesRoute } from "./updateUnreadMessagesRoute/updateUnreadMessagesRoute";
import { editMessageRoute } from "./editMessageRoute/editMessageRoute";
import { deleteMessageRoute } from "./deleteMessageRoute/deleteMessageRoute";
import { deleteChatRoute } from "./deleteChatRoute/deleteChatRoute";

///# --- UTILS ---
import { handleFiles } from "./handleFilesMiddleware";

export const messageRouter = Router();

messageRouter.get("/chats", auth, getAllChatsRoute);

messageRouter.get("/messages/:chatId", auth, getMessagesFromChatRoute);

messageRouter.post("/create/:chatId", handleFiles, auth, createMessageRoute);

messageRouter.post(
  "/update-unread-messages/:chatId",
  auth,
  updateUnreadMessagesRoute
);

messageRouter.put("/edit-message/:messageId", auth, editMessageRoute);

messageRouter.delete("/delete-message/:messageId", auth, deleteMessageRoute);

messageRouter.delete("/delete-chat/:chatId", auth, deleteChatRoute);

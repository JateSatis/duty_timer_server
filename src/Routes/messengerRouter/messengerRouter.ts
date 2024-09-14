//# --- LIBS ---
import { Router } from "express";

//# --- AUTH ---
import { auth } from "../../auth/authMiddleware";

//# --- ROUTES ---
import { getAllChatsRoute } from "./getAllChatsRoute/getAllChatsRoute";
import { getMessagesFromChatRoute } from "./getMessagesFromChatRoute/getMessagesFromChatRoute";
import { createMessageRoute } from "./createMessageRoute/createMessageRoute";
import { updateAllUnreadMessagesRoute } from "./updateAllUnreadMessagesRoute/updateAllUnreadMessagesRoute";
import { editMessageRoute } from "./editMessageRoute/editMessageRoute";
import { deleteMessageRoute } from "./deleteMessageRoute/deleteMessageRoute";
import { deleteChatRoute } from "./deleteChatRoute/deleteChatRoute";

///# --- UTILS ---
import { handleFiles } from "./handleFilesMiddleware";
import { handleFile } from "../utils/validation/handleFileMiddleware";
import { sendBackgroundImage } from "./sendBackgroundImage/sendBackgroundImage";

export const messageRouter = Router();

//? Idea: make it so that attachments can also be edited when editing the message, so they can be
//? deleted or added new.

//? Idea: add the "edited at" field to the message, so that when the message is edited,
//? it would be possible to display when it was done under the info about when it was created

// TODO: Make additional field "isGroup" to the chat, so that it can be distinguished from the
// TODO: direct messages, as when everyone leaves the chat except two people, it's indistinguishable
// TODO: from the direct messages of those two users

// TODO: Also check things like that for group chats

// TODO: It is ideal to make two different functions for direct and group messages for those cases

messageRouter.get("/chats", auth, getAllChatsRoute);

messageRouter.get("/messages/:chatId", auth, getMessagesFromChatRoute);

messageRouter.post("/create/:chatId", handleFiles, auth, createMessageRoute);

messageRouter.post(
  "/update-all-unread-messages/:chatId",
  auth,
  updateAllUnreadMessagesRoute
);

messageRouter.put("/edit-message/:messageId", auth, editMessageRoute);

messageRouter.delete("/delete-message/:messageId", auth, deleteMessageRoute);

messageRouter.delete("/delete-chat/:chatId", auth, deleteChatRoute);

messageRouter.post(
  "/background-image/:recieverId",
  handleFile,
  auth,
  sendBackgroundImage
);

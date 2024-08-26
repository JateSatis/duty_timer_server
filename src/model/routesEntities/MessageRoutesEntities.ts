import { Chat } from "../database/Chat";
import { Message } from "../database/Message";

export type CreateMessageResponseBody = {
  id: number;
  chatId: number;
  text: string;
  creationTime: number;
  senderName: string;
  edited: boolean;
  read: boolean;
  attachmentNames: string[];
};

export type GetAllChatsResponseBody = Chat[];

export type GetMessagesFromChatResponseBody = Message[];

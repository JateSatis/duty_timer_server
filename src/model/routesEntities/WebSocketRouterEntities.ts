import { WebSocket } from "ws";
import { MessageResponseBody } from "./MessageRoutesEntities";

export type WebSocketChatsMapValue = {
  userId: string;
  socket: WebSocket;
};

export type WebSocketFriendsMapValue = {
  socket: WebSocket;
  friendIds: string[];
};

export type WebSocketStatusMessage = {
  type: "status";
  name: "user_online" | "user_offline";
  data: UserOnlineResponseBodyWS | UserOfflineResponseBodyWS;
};

export type WebSocketChatMessage = {
  type: "chat";
  name:
    | "message_sent"
    | "message_edited"
    | "message_deleted"
    | "all_messages_read"
    | "message_read"
    | "user_typing"
    | "user_stopped_typing";
  data:
    | CreateMessageResponseBodyWS
    | EditMessageResponseBodyWS
    | DeleteMessageResponseBodyWS
    | UpdateAllUnreadMessagesResponseBodyWS
    | UserTypingResponseBodyWS
    | UserStoppedTypingResponseBodyWS;
};

export type UserOnlineResponseBodyWS = {
  userId: string;
};

export type UserOfflineResponseBodyWS = {
  userId: string;
};

export type CreateMessageResponseBodyWS = MessageResponseBody;

export type DeleteMessageResponseBodyWS = {
  chatId: string;
  messageId: string;
};

export type EditMessageResponseBodyWS = {
  chatId: string;
  messageId: string;
  text: string;
};

export type UpdateAllUnreadMessagesResponseBodyWS = {
  chatId: string;
};

export type UserTypingResponseBodyWS = {
  chatId: string;
  userId: string;
  name: string;
};

export type UserStoppedTypingResponseBodyWS = {
  chatId: string;
  userId: string;
  name: string;
};

import { WebSocket } from "ws";
import { MessageResponseBody } from "./MessageRoutesEntities";

export type WebSocketChatsMapValue = {
  userId: number;
  socket: WebSocket;
};

export type WebSocketFriendsMapValue = {
  socket: WebSocket;
  friendIds: number[];
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
    | DeleteMessageResponseBodyWS
    | UpdateAllUnreadMessagesResponseBodyWS
    | UserTypingResponseBodyWS
    | UserStoppedTypingResponseBodyWS;
};

export type UserOnlineResponseBodyWS = {
  userId: number;
};

export type UserOfflineResponseBodyWS = {
  userId: number;
};

export type CreateMessageResponseBodyWS = MessageResponseBody;

export type DeleteMessageResponseBodyWS = {
  chatId: number;
  messageId: number;
};

export type EditMessageResponseBodyWS = {
  chatId: number;
  messageId: number;
  text: string;
};

export type UpdateAllUnreadMessagesResponseBodyWS = {
  chatId: number;
};

export type UserTypingResponseBodyWS = {
  chatId: number;
  userId: number;
  name: string;
};

export type UserStoppedTypingResponseBodyWS = {
  chatId: number;
  userId: number;
  name: string;
};

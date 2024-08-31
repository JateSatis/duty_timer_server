import { MessageResponseBody } from "./MessageRoutesEntities";

export type WebSocketMessage = {
  type: "send_message" | "message_read" | "user_typing";
  data: any;
};

export type SendMessageRequestBody = MessageResponseBody;

export type updateReadMessagesRequestBody = {
  chatId: number;
};

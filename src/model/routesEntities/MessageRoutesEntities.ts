export type MessageResponseBody = {
  messageId: number;
  chatId: number;
  senderId: number;
  senderName: string;
  senderAvatarLink: string | null;
  text: string;
  attachmentLinks: string[];
  creationDate: string;
  creationTime: string;
  isRead: boolean;
  isEdited: boolean;
  isSender: boolean;
};

export type ChatResponseBody = {
  chatId: number;
  companionIds: number[];
  companionNicknames: string[];
  name: string;
  imageLink: string | null;
  lastMessageText: string | null;
  lastMessageCreationTime: string | null;
  lastMessageSenderName: string | null;
  unreadMessagesAmount: number | null;
  isGroupChat: boolean;
  isOnline: boolean;
};

export type GetAllChatsResponseBody = ChatResponseBody[];

export type GetMessagesFromChatResponseBody = MessageResponseBody[];

export type CreateMessageRequestBody = {
  data: string;
};

export const createMessageRequestBodyProperties = ["data"];

export type CreateMessageResponseBody = MessageResponseBody;

export type EditMessageRequestBody = {
  text: string;
};
export const editMessageRequestBodyProperties = ["text"];

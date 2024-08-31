export type MessageResponseBody = {
  id: number;
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
  id: number;
  name: string;
  imageLink: string | null;
  lastMessageText: string | null;
  lastMessageCreationTime: string | null;
  lastMessageSenderName: string | null;
  unreadMessagesAmount: number | null;
  isGroupChat: boolean;
};

export type GetAllChatsResponseBody = ChatResponseBody[];

export type GetMessagesFromChatResponseBody = MessageResponseBody[];

export type CreateMessageResponseBody = MessageResponseBody;

export type EditMessageRequestBody = {
  text: string;
};
export const editMessageRequestBodyProperties = ["text"];

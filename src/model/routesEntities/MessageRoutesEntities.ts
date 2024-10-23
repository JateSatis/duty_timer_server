import { ChatType } from "@prisma/client";

export type MessageResponseBody = {
  messageId: string;
  chatId: string;
  senderId: string;
  senderNickname: string;
  text: string;
  attachmentLinks: string[];
  creationDate: string;
  creationTime: string;
  isRead: boolean;
  isEdited: boolean;
  isSender: boolean;
};

export type GroupMessageResponseBody = MessageResponseBody & {
  senderAvatarLink: string | null;
};

export type ChatResponseBody = {
  chatId: string;
  name: string;
  imageLink: string | null;
  lastMessageText: string | null;
  lastMessageCreationTime: string | null;
  lastMessageSenderName: string | null;
  unreadMessagesAmount: number | null;
  chatType: ChatType;
  isOnline: boolean;
};

export type ParticipantInfo = {
  id: string;
  name: string;
  chatImageLink: string | null;
};

export type GetAllChatsResponseBody = ChatResponseBody[];

export type getMessagesResponseBody = MessageResponseBody[];

export type GetDirectChatInfoResponseBody = ParticipantInfo

export type GetGroupChatInfoResponseBody = {
	name: string,
	chatImageLink: string | null,
}

export type CreateMessageRequestBody = {
  data: string;
};

export const createMessageRequestBodyProperties = ["data"];

export type CreateMessageResponseBody = GroupMessageResponseBody;

export type EditMessageRequestBody = {
  text: string;
};
export const editMessageRequestBodyProperties = ["text"];

export type CreateGroupChatRequestBody = {
  name: string;
  participantIds: string[];
};
export const createGroupChatRequestBodyProperties = ["name", "participantIds"];

export type CreateGroupChatResponseBody = ChatResponseBody;

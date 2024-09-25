export type DirectMessageResponseBody = {
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

export type MessageResponseBody = {
  messageId: string;
  chatId: string;
  senderId: string;
  senderNickname: string;
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
  chatId: string;
  name: string;
  imageLink: string | null;
  lastMessageText: string | null;
  lastMessageCreationTime: string | null;
  lastMessageSenderName: string | null;
  unreadMessagesAmount: number | null;
  isGroupChat: boolean;
  isOnline: boolean;
};

export type ParticipantInfo = {
  id: string;
  nickname: string;
  avatarLink: string | null;
};

export type GetAllChatsResponseBody = ChatResponseBody[];

export type GetDirectChatInfoResponseBody = {
  companion: ParticipantInfo;
  messages: DirectMessageResponseBody[];
};

export type GetGroupChatInfoResponseBody = {
  participants: ParticipantInfo[];
  messages: MessageResponseBody[];
};

export type CreateMessageRequestBody = {
  data: string;
};

export const createMessageRequestBodyProperties = ["data"];

export type CreateMessageResponseBody = MessageResponseBody;

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

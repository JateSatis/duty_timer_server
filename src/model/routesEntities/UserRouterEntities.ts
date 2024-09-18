import { UserType } from "../utils/Enums";

export type ForeignUserInfoResponseBody = {
  id: string;
  nickname: string;
  avatarLink: string | null;
};

export type GetUserInfoResponseBody = {
  id: string;
  name: string;
  nickname: string;
  login: string;
  avatarLink: string | null;
  userType: UserType | null;
};

export type GetUserByIdResponseBody = ForeignUserInfoResponseBody;

export type GetUsersByNameRequestBody = {
  name: string;
};

export type GetUsersByNameResponseBody = ForeignUserInfoResponseBody[];

export type UploadAvatarResponseBody = {
  avatarLink: string;
};

export type GetAvatarLinkResponseBody = {
  imageUrl: string | null;
};

export type UpdateSettingsRequestBody = {
  language: string;
  theme: string;
};

export const updateSettingsRequestBodyProperties = ["language", "theme"];

export type GetSettingsResponseBody = {
  backgroundImageLink: string | null;
  theme: string;
  language: string;
};
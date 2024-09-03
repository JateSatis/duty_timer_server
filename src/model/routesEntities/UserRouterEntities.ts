import { User } from "../database/User";
import { UserType } from "../utils/Enums";

export type ForeignUserInfoResponseBody = {
  id: number;
  name: string;
  nickname: string;
  avatarLink: string | null;
};

export type GetUserInfoResponseBody = {
  id: number;
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

import { User } from "../database/User";

export type GetUserInfoResponseBody = User;

export type GetUserByIdResponseBody = User;

export type GetUsersByNameRequestBody = {
  name: string;
};

export type GetUsersByNameResponseBody = User[];

export type UploadAvatarResponseBody = {
  avatarLink: string;
};

export type GetAvatarLinkResponseBody = {
  imageUrl: string;
};

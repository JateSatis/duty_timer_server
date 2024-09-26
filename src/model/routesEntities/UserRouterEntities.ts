export type ForeignUserInfoResponseBody = {
  id: string;
  nickname: string;
	avatarLink: string | null;
	isFriend: boolean;
	isFriendshipRequestSent: boolean,
	isFriendshipRequestRecieved: boolean
};

export type GetUserInfoResponseBody = {
  id: string;
  nickname: string;
  login: string;
  avatarLink: string | null;
  userType: string;
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
  avatarLink: string | null;
};

export type UpdateSettingsRequestBody = {
  language: string;
  theme: string;
  backgroundTint: boolean;
};

export const updateSettingsRequestBodyProperties = ["language", "theme"];

export type GetSettingsResponseBody = {
  backgroundImageLink: string | null;
  backgroundTint: boolean;
  theme: string;
  language: string;
};

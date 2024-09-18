import { AccountInfo } from "@prisma/client";
import { S3DataSource } from "../../../model/config/imagesConfig";
import { ForeignUserInfoResponseBody } from "../../../model/routesEntities/UserRouterEntities";

export const transformUsersForResponse = async (
  accountsInfo: AccountInfo[]
) => {
  const usersInfo = await Promise.all(
    accountsInfo.map(async (accountInfo) => {
      let avatarLink = null;
      if (accountInfo.avatarImageName) {
        avatarLink = await S3DataSource.getImageUrlFromS3(
          accountInfo.avatarImageName
        );
      }

      const getUserInfoResponseBody: ForeignUserInfoResponseBody = {
        id: accountInfo.userId,
        nickname: accountInfo.nickname,
        avatarLink,
      };

      return getUserInfoResponseBody;
    })
  );

  return usersInfo;
};

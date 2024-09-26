import { Prisma, User } from "@prisma/client";
import { S3DataSource } from "../../../model/config/imagesConfig";
import { ForeignUserInfoResponseBody } from "../../../model/routesEntities/UserRouterEntities";

export const transformUsersForResponse = async (
  users: UserWithAccountInfo[]
) => {
  const usersInfo = await Promise.all(
    users.map(async (user) => {
      let avatarLink = null;
      if (user.accountInfo!.avatarImageName) {
        avatarLink = await S3DataSource.getImageUrlFromS3(
          user.accountInfo!.avatarImageName
        );
      }
      // TODO: Make this response right
      const getUserInfoResponseBody: ForeignUserInfoResponseBody = {
        id: user.id,
        nickname: user.accountInfo!.nickname,
        avatarLink,
        isFriend: true,
        isFriendshipRequestRecieved: true,
        isFriendshipRequestSent: true,
      };
      return getUserInfoResponseBody;
    })
  );
  return usersInfo;
};

type UserWithAccountInfo = Prisma.UserGetPayload<{
  include: {
    accountInfo: true;
  };
}>;

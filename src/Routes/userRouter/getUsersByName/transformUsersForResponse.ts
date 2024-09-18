import { S3DataSource } from "model/config/imagesConfig";
import { User } from "model/database/User";
import { ForeignUserInfoResponseBody } from "model/routesEntities/UserRouterEntities";

export const transformUsersForResponse = async (users: User[]) => {
  const usersInfo = await Promise.all(
    users.map(async (user) => {
      let avatarLink = null;
      if (user.avatarImageName) {
        avatarLink = await S3DataSource.getImageUrlFromS3(user.avatarImageName);
      }

      const getUserInfoResponseBody: ForeignUserInfoResponseBody = {
        id: user.id,
        name: user.name,
        nickname: user.nickname,
        avatarLink,
      };

      return getUserInfoResponseBody;
    })
  );

  return usersInfo;
};

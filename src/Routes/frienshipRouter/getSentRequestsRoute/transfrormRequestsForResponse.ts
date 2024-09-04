import { SentFriendshipRequestInfo } from "src/model/routesEntities/FriendshipRouterEntities";
import { S3DataSource } from "../../../model/config/imagesConfig";
import { FriendshipRequest } from "../../../model/database/FriendshipRequest";

export const transformRequestsForResponse = async (
  requests: FriendshipRequest[]
) => {
  const s3DataSource = new S3DataSource();

  const usersInfo = await Promise.all(
    requests.map(async (request) => {
      let avatarLink = null;
      if (request.reciever.avatarImageName) {
        avatarLink = await s3DataSource.getImageUrlFromS3(
          request.reciever.avatarImageName
        );
      }

      const sentFriendshipRequestInfo: SentFriendshipRequestInfo = {
        id: request.id,
        recieverId: request.reciever.id,
        recieverName: request.reciever.name,
        recieverNickname: request.reciever.nickname,
        recieverAvatarLink: avatarLink,
      };

      return sentFriendshipRequestInfo;
    })
  );

  return usersInfo;
};

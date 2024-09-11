import { RecievedFriendshipRequestInfo } from "../../../model/routesEntities/FriendshipRouterEntities";
import { S3DataSource } from "../../../model/config/imagesConfig";
import { FriendshipRequest } from "../../../model/database/FriendshipRequest";

export const transformRequestsForResponse = async (
  requests: FriendshipRequest[]
) => {
  const s3DataSource = new S3DataSource();

  const usersInfo = await Promise.all(
    requests.map(async (request) => {
      let avatarLink = null;
      if (request.sender.avatarImageName) {
        avatarLink = await s3DataSource.getImageUrlFromS3(
          request.sender.avatarImageName
        );
      }

      const recievedFriendshipRequestInfo: RecievedFriendshipRequestInfo = {
        id: request.id,
        senderId: request.sender.id,
        senderName: request.sender.name,
        senderNickname: request.sender.nickname,
        senderAvatarLink: avatarLink,
      };

      return recievedFriendshipRequestInfo;
    })
  );

  return usersInfo;
};

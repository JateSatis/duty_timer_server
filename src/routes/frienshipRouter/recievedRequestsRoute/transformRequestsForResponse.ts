import { RecievedFriendshipRequestInfo } from "../../../model/routesEntities/FriendshipRouterEntities";
import { S3DataSource } from "../../../model/config/imagesConfig";
import { prisma } from "../../../model/config/prismaClient";

export const transformRequestsForResponse = async (requestIds: string[]) => {
  const requests = await getJoinedRequests(requestIds);

  const usersInfo = await Promise.all(
    requests.map(async (request) => {
      let avatarLink = null;
      if (request.sender.avatarImageName) {
        avatarLink = await S3DataSource.getImageUrlFromS3(
          request.sender.avatarImageName
        );
      }

      const recievedFriendshipRequestInfo: RecievedFriendshipRequestInfo = {
        id: request.id,
        senderId: request.senderId,
        senderNickname: request.sender.nickname,
        senderAvatarLink: avatarLink,
      };

      return recievedFriendshipRequestInfo;
    })
  );

  return usersInfo;
};

const getJoinedRequests = async (requestIds: string[]) => {
  const requests = await prisma.friendshipRequest.findMany({
    where: {
      id: { in: requestIds },
    },
    include: {
      reciever: true,
      sender: true,
    },
  });

  return requests;
};

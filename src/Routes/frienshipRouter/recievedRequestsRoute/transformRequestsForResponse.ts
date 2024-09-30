import { RecievedFriendshipRequestInfo } from "../../../model/routesEntities/FriendshipRouterEntities";
import { S3DataSource } from "../../../model/config/imagesConfig";
import { prisma } from "../../../model/config/prismaClient";

export const transformRequestsForResponse = async (requestIds: string[]) => {
  const requests = await getJoinedRequests(requestIds);

  const usersInfo = await Promise.all(
    requests.map(async (request) => {
      let avatarLink = null;
      if (request.sender.accountInfo!.avatarImageName) {
        avatarLink = await S3DataSource.getImageUrlFromS3(
          request.sender.accountInfo!.avatarImageName
        );
      }

      const recievedFriendshipRequestInfo: RecievedFriendshipRequestInfo = {
        id: request.id,
        senderId: request.senderId,
        senderNickname: request.sender.accountInfo!.nickname,
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
      reciever: {
        include: {
          accountInfo: true,
        },
      },
      sender: {
        include: {
          accountInfo: true,
        },
      },
    },
  });

  return requests;
};

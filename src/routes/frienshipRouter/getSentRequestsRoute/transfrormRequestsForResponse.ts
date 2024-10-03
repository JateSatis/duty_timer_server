import { SentFriendshipRequestInfo } from "../../../model/routesEntities/FriendshipRouterEntities";
import { S3DataSource } from "../../../model/config/imagesConfig";
import { prisma } from "../../../model/config/prismaClient";

export const transformRequestsForResponse = async (requestIds: string[]) => {
  const requests = await getJoinedRequests(requestIds);

  const usersInfo = await Promise.all(
    requests.map(async (request) => {
      let avatarLink = null;
      if (request.reciever.accountInfo!.avatarImageName) {
        avatarLink = await S3DataSource.getImageUrlFromS3(
          request.reciever.accountInfo!.avatarImageName
        );
      }

      const sentFriendshipRequestInfo: SentFriendshipRequestInfo = {
        id: request.id,
        recieverId: request.recieverId,
        recieverNickname: request.reciever.accountInfo!.nickname,
        recieverAvatarLink: avatarLink,
      };

      return sentFriendshipRequestInfo;
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

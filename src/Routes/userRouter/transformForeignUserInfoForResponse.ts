import { S3DataSource } from "../../model/config/imagesConfig";
import { ForeignUserInfoResponseBody } from "../../model/routesEntities/UserRouterEntities";
import { prisma } from "../../model/config/prismaClient";
import { DATABASE_ERROR } from "../utils/errors/GlobalErrors";
import { DATA_NOT_FOUND } from "../utils/errors/AuthErrors";

export const transformForeignUserInfoForResponse = async (
  userId: string,
  foreignUserId: string,
  isFriend: boolean | null = null,
  isFriendshipRequestSent: boolean | null = null,
  isFriendshipRequestRecieved: boolean | null = null
) => {
  let accountInfo;
  try {
    accountInfo = await prisma.accountInfo.findFirst({
      where: {
        userId: foreignUserId,
      },
    });
  } catch (error) {
    throw new DATABASE_ERROR(error);
  }

  if (!accountInfo) {
    throw new DATA_NOT_FOUND("AccountInfo", `userId = ${foreignUserId}`);
  }

  let avatarLink = null;
  if (accountInfo.avatarImageName) {
    avatarLink = await S3DataSource.getImageUrlFromS3(
      accountInfo.avatarImageName
    );
  }

  const frienshipStatus = await getFriendshipStatus(
    userId,
    accountInfo.userId,
    isFriend,
    isFriendshipRequestSent,
    isFriendshipRequestRecieved
  );

  const getUserInfoResponseBody: ForeignUserInfoResponseBody = {
    id: accountInfo.userId,
    nickname: accountInfo.nickname,
    avatarLink,
    isFriend: frienshipStatus.isFriend,
    isFriendshipRequestSent: frienshipStatus.isFriendshipRequestSent,
    isFriendshipRequestRecieved: frienshipStatus.isFriendshipRequestRecieved,
  };

  return getUserInfoResponseBody;
};

const getFriendshipStatus = async (
  userId: string,
  foreignUserId: string,
  isFriendArg: boolean | null,
  isFriendshipRequestSentArg: boolean | null,
  isFriendshipRequestRecievedArg: boolean | null
) => {
  let isFriend;
  if (isFriendArg != null) {
    //# If it is already known if user is a friend, assign it immediately
    isFriend = isFriendArg;
  } else {
    try {
      const friendship = await prisma.frienship.findFirst({
        where: {
          OR: [
            { user1Id: userId, user2Id: foreignUserId },
            { user1Id: foreignUserId, user2Id: userId },
          ],
        },
      });
      isFriend = !!friendship;
    } catch (error) {
      throw new DATABASE_ERROR(error);
    }
  }

  let isFriendshipRequestSent;
  if (isFriendshipRequestSentArg != null) {
    //# If it is already known if a request was sent to the user, assign it immediately
    isFriendshipRequestSent = isFriendshipRequestSentArg;
  } else {
    try {
      const sentFriendshipRequest = await prisma.friendshipRequest.findFirst({
        where: {
          senderId: userId,
          recieverId: foreignUserId,
        },
      });
      isFriendshipRequestSent = !!sentFriendshipRequest;
    } catch (error) {
      throw new DATABASE_ERROR(error);
    }
  }

  let isFriendshipRequestRecieved;
  if (isFriendshipRequestRecievedArg != null) {
    //# If it is already known if a request was recieved from the user, assign it immediately
    isFriendshipRequestRecieved = isFriendshipRequestRecievedArg;
  } else {
    try {
      const recievedFriendshipRequest =
        await prisma.friendshipRequest.findFirst({
          where: {
            senderId: foreignUserId,
            recieverId: userId,
          },
        });
      isFriendshipRequestRecieved = !!recievedFriendshipRequest;
    } catch (error) {
      throw new DATABASE_ERROR(error);
    }
  }

  return {
    isFriend,
    isFriendshipRequestSent,
    isFriendshipRequestRecieved,
  };
};

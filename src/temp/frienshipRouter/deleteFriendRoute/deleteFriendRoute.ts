//# --- LIBS ---
import { Request, Response } from "express";

//# --- DATABASE ---
import { prisma } from "../../../model/config/prismaClient";
import { User } from "@prisma/client";

//# --- VALIDATE REQUEST ---
import { emptyParam } from "../../utils/validation/emptyParam";

//# --- ERRORS ---
import { DATABASE_ERROR, err } from "../../utils/errors/GlobalErrors";
import { DATA_NOT_FOUND } from "../../utils/errors/AuthErrors";

export const deleteFriendRoute = async (req: Request, res: Response) => {
  if (emptyParam(req, res, "friendId")) return res;

  const friendId = req.params.friendId;

  const user: User = req.body.user;

  let friendship;
  try {
    friendship = await prisma.frienship.findFirst({
      where: {
        OR: [
          { user1Id: user.id, user2Id: friendId },
          { user1Id: friendId, user2Id: user.id },
        ],
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  if (!friendship) {
    return res
      .status(404)
      .json(
        err(new DATA_NOT_FOUND("Friendship", `ids = [${user.id}, ${friendId}]`))
      );
  }

  try {
    await prisma.frienship.delete({
      where: {
        id: friendship.id,
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  return res.sendStatus(200);
};

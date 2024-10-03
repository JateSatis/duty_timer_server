//# --- LIBS ---
import { Request, Response } from "express";

//# --- CONFIG ---

//# --- DATABASE ENTITIES ---

//# --- REQUEST ENTITIES ---

//# --- VALIDATE REQUEST ---
import { emptyParam } from "../../utils/validation/emptyParam";

//# --- ERRORS ---
import { DATA_NOT_FOUND } from "../../utils/errors/AuthErrors";
import { USER_ALREADY_FRIEND } from "../../utils/errors/FriendshipErrors";
import {
  DATABASE_ERROR,
  err,
  FORBIDDEN_ACCESS,
} from "../../utils/errors/GlobalErrors";
import { User } from "@prisma/client";
import { prisma } from "../../../model/config/prismaClient";

export const sendRequestRoute = async (req: Request, res: Response) => {
  const user: User = req.body.user;

  if (emptyParam(req, res, "recieverId")) return res;

  const recieverId = req.params.recieverId;

  let existingRequest;
  try {
    existingRequest = await prisma.friendshipRequest.findFirst({
      where: {
        senderId: user.id,
        recieverId: recieverId,
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  //# If friendship request is already sent to this user, return error
  if (existingRequest) {
    return res.status(400).json(err(new FORBIDDEN_ACCESS()));
  }

  //# If reciever of the request is the user himself, return error
  if (recieverId == user.id) {
    return res.status(400).json(err(new FORBIDDEN_ACCESS()));
  }

  let friendship;
  try {
    friendship = await prisma.frienship.findFirst({
      where: {
        OR: [
          { user1Id: user.id, user2Id: recieverId },
          { user1Id: recieverId, user2Id: user.id },
        ],
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  //# Check if there is already a friendship between user and friend
  if (friendship) {
    return res.status(401).send(err(new USER_ALREADY_FRIEND()));
  }

  let reciever;
  try {
    reciever = await prisma.user.findFirst({
      where: {
        id: recieverId,
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  if (!reciever) {
    return res
      .status(404)
      .json(err(new DATA_NOT_FOUND("user", `id = ${recieverId}`)));
  }

  try {
    await prisma.friendshipRequest.create({
      data: {
        senderId: user.id,
        recieverId: recieverId,
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  return res.sendStatus(200);
};

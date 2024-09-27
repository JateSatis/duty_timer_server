//# --- LIBS ---
import { Request, Response } from "express";

//# --- CONFIG ---

//# --- DATABASE ENTITIES ---

//# --- REQUEST ENTITIES ---
import { GetUserByIdResponseBody } from "../../../model/routesEntities/UserRouterEntities";

//# --- VALIDATE REQUEST ---
import { emptyParam } from "../../utils/validation/emptyParam";

//# --- ERRORS ---
import {
  err,
  ServerError,
  UNKNOWN_ERROR,
} from "../../utils/errors/GlobalErrors";
import { transformForeignUserInfoForResponse } from "../transformForeignUserInfoForResponse";
import { User } from "@prisma/client";

export const getUserById = async (req: Request, res: Response) => {
  let user: User = req.body.user;

  if (emptyParam(req, res, "foreignUserId")) return res;
  const foreignUserId = req.params.foreignUserId;

  let getForeignUserInfoResponseBody: GetUserByIdResponseBody;
  try {
    getForeignUserInfoResponseBody = await transformForeignUserInfoForResponse(
      user.id,
      foreignUserId
    );
  } catch (error) {
    if (error instanceof ServerError) {
      return res.status(400).json(err(error));
    } else {
      return res.status(400).json(err(new UNKNOWN_ERROR(error)));
    }
  }

  return res.status(200).json(getForeignUserInfoResponseBody);
};

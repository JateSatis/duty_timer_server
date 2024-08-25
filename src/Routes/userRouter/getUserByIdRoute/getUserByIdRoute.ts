//# --- LIBS ---
import { Request, Response } from "express";

//# --- CONFIG ---
import { dutyTimerDataSource } from "../../../model/config/initializeConfig";

//# --- DATABASE ENTITIES ---
import { User } from "../../../model/database/User";

//# --- REQUEST ENTITIES ---
import { GetUserByIdResponseBody } from "../../../model/routesEntities/UserRouterEntities";

//# --- VALIDATE REQUEST ---
import { invalidParamType } from "../../utils/validation/invalidParamType";
import { emptyParam } from "../../utils/validation/emptyParam";

//# --- ERRORS ---
import { err } from "../../utils/errors/GlobalErrors";
import { DATABASE_ERROR } from "../../utils/errors/GlobalErrors";
import { NON_EXISTANT_USER } from "../../utils/errors/AuthErrors";

export const getUserByIdRoute = async (req: Request, res: Response) => {
	if (invalidParamType(req, res, "userId")) return res;
	
	if (emptyParam(req, res, "userId")) return res;

  const userId = parseInt(req.params.userId);

  let user: User | null;
  try {
    user = await dutyTimerDataSource
      .getRepository(User)
      .createQueryBuilder("user")
      .select(["user.id", "user.name", "user.nickname", "user.avatarImageName"])
      .where("user.id = :userId", { userId })
      .getOne();
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error.message)));
  }

  if (!user) {
    return res.status(400).json(err(new NON_EXISTANT_USER("id", userId)));
  }

  const getForeignUserInfoResponseBody: GetUserByIdResponseBody = user;

  return res.status(200).json(getForeignUserInfoResponseBody);
};

import { Response } from "express";
import { err } from "../../utils/errors/GlobalErrors";
import { INVALID_INPUT_FORMAT } from "../../utils/errors/AuthErrors";
import { CreateGroupChatRequestBody } from "../../../model/routesEntities/MessageRoutesEntities";

const participantIdFormat = /^-?\d+$/;

export const invalidInputFormat = (
  res: Response,
  createGroupChatRequestBody: CreateGroupChatRequestBody
): boolean => {
  const { name, participantIds } = createGroupChatRequestBody;

  const invalidIds = participantIds.filter(
    (participantId) => !participantIdFormat.test(participantId.toString())
  );

  if (name.length > 50 || invalidIds.length != 0) {
    const error = new INVALID_INPUT_FORMAT();
    res.status(error.code).json(error.toString());
    return true;
  }

  return false;
};

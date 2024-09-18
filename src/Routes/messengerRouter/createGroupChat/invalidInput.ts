import { Response } from "express";
import { err } from "Routes/utils/errors/GlobalErrors";
import { INVALID_INPUT_FORMAT } from "Routes/utils/errors/AuthErrors";
import { CreateGroupChatRequestBody } from "model/routesEntities/MessageRoutesEntities";

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
    res.status(400).json(err(new INVALID_INPUT_FORMAT()));
    return true;
  }

  return false;
};

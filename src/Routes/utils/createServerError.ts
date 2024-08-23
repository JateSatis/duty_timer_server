import { ServerError } from "./ServerError";

export const err = (serverError: ServerError) => {
  return {
    name: serverError.name,
    message: serverError.message,
  };
};

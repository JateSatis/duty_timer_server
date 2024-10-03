import { ServerError } from "./GlobalErrors";

export class USER_ALREADY_FRIEND extends ServerError {
  constructor() {
    super("USER_ALREADY_FRIEND", "You are already friends with this user.");
  }
}

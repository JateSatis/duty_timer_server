"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USER_ALREADY_FRIEND = void 0;
const GlobalErrors_1 = require("./GlobalErrors");
class USER_ALREADY_FRIEND extends GlobalErrors_1.ServerError {
    constructor() {
        super("USER_ALREADY_FRIEND", "You are already friends with this user.");
    }
}
exports.USER_ALREADY_FRIEND = USER_ALREADY_FRIEND;
//# sourceMappingURL=FriendshipErrors.js.map
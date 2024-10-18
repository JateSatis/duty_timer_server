"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidInputFormat = void 0;
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const AuthErrors_1 = require("../../utils/errors/AuthErrors");
const participantIdFormat = /^-?\d+$/;
const invalidInputFormat = (res, createGroupChatRequestBody) => {
    const { name, participantIds } = createGroupChatRequestBody;
    const invalidIds = participantIds.filter((participantId) => !participantIdFormat.test(participantId.toString()));
    if (name.length > 50 || invalidIds.length != 0) {
        res.status(400).json((0, GlobalErrors_1.err)(new AuthErrors_1.INVALID_INPUT_FORMAT()));
        return true;
    }
    return false;
};
exports.invalidInputFormat = invalidInputFormat;
//# sourceMappingURL=invalidInput.js.map
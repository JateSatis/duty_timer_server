"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MISSING_FILE = void 0;
const GlobalErrors_1 = require("./GlobalErrors");
class MISSING_FILE extends GlobalErrors_1.ServerError {
    constructor() {
        super("MISSING_FILE", "The required image file part is not provided. Please attach the file to the request and try again");
    }
}
exports.MISSING_FILE = MISSING_FILE;
//# sourceMappingURL=UserErrors.js.map
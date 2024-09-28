"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const nodeEnv = process.env.NODE_ENV || "development";
let datasourceUrl;
if (nodeEnv === "production") {
    datasourceUrl = process.env.DATABASE_URL_PROD;
}
else {
    datasourceUrl = process.env.DATABASE_URL_DEV;
}
exports.prisma = new client_1.PrismaClient({
    datasourceUrl,
});
//# sourceMappingURL=prismaClient.js.map
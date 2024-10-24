"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEvents = void 0;
const missingRequestFields_1 = require("./missingRequestFields");
const emptyFiels_1 = require("./emptyFiels");
const invalidInputFormat_1 = require("./invalidInputFormat");
const prismaClient_1 = require("../../../model/config/prismaClient");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const createEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.body.user;
    if ((0, missingRequestFields_1.missingRequestField)(req, res))
        return res;
    if ((0, emptyFiels_1.emptyField)(req, res))
        return res;
    const createEventRequestBody = req.body;
    if ((0, invalidInputFormat_1.invalidInputFormat)(res, createEventRequestBody))
        return res;
    try {
        createEventRequestBody.events.forEach((event) => __awaiter(void 0, void 0, void 0, function* () {
            yield prismaClient_1.prisma.event.create({
                data: {
                    userId: user.id,
                    title: event.title,
                    timeMillis: BigInt(event.timeMillis),
                },
            });
        }));
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    return res.sendStatus(200);
});
exports.createEvents = createEvents;
//# sourceMappingURL=createEvents.js.map
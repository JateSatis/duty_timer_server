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
exports.getEventByIdRoute = void 0;
const initializeConfig_1 = require("../../../model/config/initializeConfig");
const Event_1 = require("../../../model/database/Event");
const emptyParam_1 = require("../../utils/validation/emptyParam");
const invalidParamType_1 = require("../../utils/validation/invalidParamType");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const AuthErrors_1 = require("../../utils/errors/AuthErrors");
const getEventByIdRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if ((0, invalidParamType_1.invalidParamType)(req, res, "eventId"))
        return res;
    if ((0, emptyParam_1.emptyParam)(req, res, "eventId"))
        return res;
    const eventId = parseInt(req.params.eventId);
    const user = req.body.user;
    let events;
    try {
        events = yield initializeConfig_1.DB.getEventsByUserId(user.id);
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    const eventIds = events.map((event) => event.id);
    if (!eventIds.includes(eventId)) {
        return res.status(403).json((0, GlobalErrors_1.err)(new GlobalErrors_1.FORBIDDEN_ACCESS()));
    }
    let event;
    try {
        event = yield Event_1.Event.findOneBy({
            id: eventId,
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    if (!event) {
        return res
            .status(404)
            .json((0, GlobalErrors_1.err)(new AuthErrors_1.DATA_NOT_FOUND("event", `id = ${eventId}`)));
    }
    const getSpecificEventResponseBody = event;
    return res.status(200).json(getSpecificEventResponseBody);
});
exports.getEventByIdRoute = getEventByIdRoute;
//# sourceMappingURL=getEventByIdRoute.js.map
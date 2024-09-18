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
exports.updateEventRoute = void 0;
const initializeConfig_1 = require("../../../model/config/initializeConfig");
const Event_1 = require("../../../model/database/Event");
const EventsRouterEntities_1 = require("../../../model/routesEntities/EventsRouterEntities");
const emptyField_1 = require("../../utils/validation/emptyField");
const missingRequestField_1 = require("../../utils/validation/missingRequestField");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const invalidParamType_1 = require("../../utils/validation/invalidParamType");
const emptyParam_1 = require("../../utils/validation/emptyParam");
const invalidInputFormat_1 = require("./invalidInputFormat");
const updateEventRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if ((0, missingRequestField_1.missingRequestField)(req, res, EventsRouterEntities_1.updateEventRequestBodyProperties))
        return res;
    if ((0, emptyField_1.emptyField)(req, res, EventsRouterEntities_1.updateEventRequestBodyProperties))
        return res;
    const updateEventRequestBody = req.body;
    if ((0, invalidInputFormat_1.invalidInputFormat)(res, updateEventRequestBody))
        return res;
    if ((0, invalidParamType_1.invalidParamType)(req, res, "eventId"))
        return res;
    if ((0, emptyParam_1.emptyParam)(req, res, "eventId"))
        return res;
    const eventId = parseInt(req.params.eventId);
    const user = req.body.user;
    const events = yield initializeConfig_1.DB.getEventsByUserId(user.id);
    const eventIds = events.map((event) => event.id);
    if (!eventIds.includes(eventId)) {
        return res.status(401).json((0, GlobalErrors_1.err)(new GlobalErrors_1.FORBIDDEN_ACCESS()));
    }
    const event = events.find((event) => event.id == eventId);
    event.title = updateEventRequestBody.title;
    event.timeMillis = parseInt(updateEventRequestBody.timeMillis);
    try {
        yield Event_1.Event.save(event);
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    const updateEventResponseBody = event;
    return res.status(200).json(updateEventResponseBody);
});
exports.updateEventRoute = updateEventRoute;
//# sourceMappingURL=updateEventRoute.js.map
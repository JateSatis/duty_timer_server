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
exports.createEventRoute = void 0;
const Event_1 = require("../../../model/database/Event");
const EventsRouterEntities_1 = require("../../../model/routesEntities/EventsRouterEntities");
const emptyField_1 = require("../../utils/validation/emptyField");
const missingRequestField_1 = require("../../utils/validation/missingRequestField");
const invalidInputFormat_1 = require("./invalidInputFormat");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const createEventRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if ((0, missingRequestField_1.missingRequestField)(req, res, EventsRouterEntities_1.createEventRequestBodyProperties))
        return res;
    if ((0, emptyField_1.emptyField)(req, res, EventsRouterEntities_1.createEventRequestBodyProperties))
        return res;
    const createEventRequestBody = req.body;
    if ((0, invalidInputFormat_1.invalidInputFormat)(res, createEventRequestBody))
        return res;
    const user = req.body.user;
    const event = Event_1.Event.create({
        title: createEventRequestBody.title,
        timeMillis: parseInt(createEventRequestBody.timeMillis),
        user: user,
    });
    try {
        yield event.save();
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    const createEventResponseBody = {
        id: event.id,
        title: event.title,
        timeMillis: event.timeMillis,
    };
    return res.status(200).json(createEventResponseBody);
});
exports.createEventRoute = createEventRoute;
//# sourceMappingURL=createEventRoute.js.map
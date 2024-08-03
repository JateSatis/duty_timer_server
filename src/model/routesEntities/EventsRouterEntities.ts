import { Event } from "../database/Event";

export type GetAllEventsResponseBody = Event[];

export type GetSpecificEventResponseBody = Event;

export type CreateEventRequestBody = {
  title: string;
  eventTimeMillis: string;
};

export type UpdateEventRequestBody = CreateEventRequestBody;

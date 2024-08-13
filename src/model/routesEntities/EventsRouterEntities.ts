import { Event } from "../database/Event";

type ResponseEvent = {
  id: number;
  title: string;
  timeMillis: number;
};

export type GetAllEventsResponseBody = ResponseEvent[];

export type GetSpecificEventResponseBody = Event;

export type CreateEventRequestBody = {
  title: string;
  eventTimeMillis: string;
};

export type UpdateEventRequestBody = CreateEventRequestBody;

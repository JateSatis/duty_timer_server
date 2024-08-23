import { Event } from "../database/Event";

type ResponseEvent = {
  id: number;
  title: string;
  timeMillis: number;
};

export type GetAllEventsResponseBody = ResponseEvent[];

export type GetSpecificEventResponseBody = ResponseEvent;

export type CreateEventRequestBody = {
  title: string;
  timeMillis: string;
};

export type CreateEventResponseBody = ResponseEvent;

export type UpdateEventRequestBody = CreateEventRequestBody;

export type UpdateEventResponseBody = ResponseEvent;
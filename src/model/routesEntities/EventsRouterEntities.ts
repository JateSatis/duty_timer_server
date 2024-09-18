type ResponseEvent = {
  id: string;
  title: string;
  timeMillis: number;
};

type RequestEvent = {
  title: string;
  timeMillis: string;
};

export type GetAllEventsResponseBody = ResponseEvent[];

export type GetSpecificEventResponseBody = ResponseEvent;

export type CreateEventRequestBody = RequestEvent;
export const createEventRequestBodyProperties = ["title", "timeMillis"];

export type CreateEventsRequestBody = {
  events: RequestEvent[];
};

export type CreateEventResponseBody = ResponseEvent;

export type UpdateEventRequestBody = CreateEventRequestBody;
export const updateEventRequestBodyProperties =
  createEventRequestBodyProperties;

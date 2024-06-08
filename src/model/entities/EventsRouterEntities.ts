import { Event } from "../Event";

class GetAllEventsResponseBody {
  events: Event[];
}

class CreateEventRequestBody {
  title: String;
  millis: String;
}

class UpdateEventRequestBody extends CreateEventRequestBody { }
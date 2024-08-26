import { Timer } from "../database/Timer";
import { Expose } from "class-transformer";

export type GetTimerResponseBody = Timer;

export type UpdateTimerRequestBody = {
  startTimeMillis: string;
  endTimeMillis: string;
};
export const updateTimerRequestBodyProperties = [
  "startTimerMillis",
  "endTimeMillis",
];

export type UpdateTimerResponseBody = Timer;

export type ConnectToTimerResponseBody = Timer;

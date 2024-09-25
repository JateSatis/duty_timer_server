import { Timer } from "../database/Timer";
import { Expose } from "class-transformer";

export type GetTimerResponseBody = {
  startTimeMillis: number;
  endTimeMillis: number;
};

export type CreateTimerRequestBody = {
  startTimeMillis: string;
  endTimeMillis: string;
};
export const createTimerRequestBodyProperties = [
  "startTimeMillis",
  "endTimeMillis",
];

export type UpdateTimerRequestBody = {
  startTimeMillis: string;
  endTimeMillis: string;
};
export const updateTimerRequestBodyProperties = [
  "startTimeMillis",
  "endTimeMillis",
];

export type UpdateTimerResponseBody = {
  startTimeMillis: number;
  endTimeMillis: number;
};

export type ConnectToTimerResponseBody = {
  startTimeMillis: number;
  endTimeMillis: number;
};

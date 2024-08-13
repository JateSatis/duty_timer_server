import { Timer } from "../database/Timer";
import { Expose } from "class-transformer";

export class TimerDTO {
  @Expose()
  id: number;

  @Expose()
  startTimeMillis: number;

  @Expose()
  endTimeMillis: number;
}

export type GetTimerResponseBody = Timer;

export type UpdateTimerRequestBody = {
  startTimeMillis: number;
  endTimeMillis: number;
};

export type UpdateTimerResponseBody = Timer;

export type ConnectToTimerResponseBody = Timer;

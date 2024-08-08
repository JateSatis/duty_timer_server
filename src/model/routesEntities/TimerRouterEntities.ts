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
  startTimeMillis: string;
  endTimeMillis: string;
};

export type UpdateTimerResponseBody = Timer;

export type ConnectToTimerResponseBody = Timer;

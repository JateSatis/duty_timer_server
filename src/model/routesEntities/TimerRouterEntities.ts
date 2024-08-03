import { Long } from "typeorm";
import { Timer } from "../database/Timer";

export type GetTimerResponseBody = Timer

export type UpdateTimerRequestBody = {
	startTimeMillis: string;
	endTimeMillis: string;
}

export type UpdateTimerResponseBody = Timer;

export type ConnectToTimerResponseBody = Timer;
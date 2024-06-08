import { Long } from "typeorm";

class GetTimerResponseBody {
	id: number;
	startTime: Long;
	endTime: Long;
}

class UpdateTimerRequestBody {
	startTimeMillis: string;
	endTimeMillis: string;
}

class UpdateTimerResponseBody extends GetTimerResponseBody { }

class ConnectToTimerResponseBody extends GetTimerResponseBody {}
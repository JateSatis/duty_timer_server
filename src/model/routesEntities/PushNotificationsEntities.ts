import { Platform } from "@prisma/client"

export type AddDeviceRequestBody = {
	platform: Platform
	deviceToken: string,
}

export const addDeviceRequestBodyProperties = ["platform", "deviceToken"];
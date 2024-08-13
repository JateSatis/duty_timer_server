export type SendMessageRequestBody = {
	id: number
	chatId: number,
	text: string,
	creationTime: number,
	senderName: string,
	edited: boolean,
	read: boolean,
	attachmentNames: string[]
}

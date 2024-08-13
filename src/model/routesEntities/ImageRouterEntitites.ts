import { Attachment } from "../database/Attachment";

export type UploadImageRequesBody = {
  messageId: string;
};

export type UploadImageResponseBody = Attachment;

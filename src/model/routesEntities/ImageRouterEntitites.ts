import { Image } from "../database/Image";

export type UploadImageRequesBody = {
  messageId: string;
};

export type UploadImageResponseBody = Image;

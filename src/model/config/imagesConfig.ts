import * as dotenv from "dotenv";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

dotenv.config();

type UploadImageParams = {
  Key: string;
  Body: Buffer;
  ContentType: string;
};

type DownloadImageParams = {
  Key: string;
};

type DeleteImageParams = {
  Key: string;
};

export class S3DataSource {
  private s3 = new S3Client({
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY!!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!!,
    },
    region: process.env.S3_REGION,
    endpoint: process.env.S3_ENDPOINT,
    apiVersion: "latest",
  });

  private bucketName = process.env.S3_BUCKET_NAME;

  public generateUniqueImageName = (imageName: string) => {
    const timestamp = new Date().getTime();
    const randomString = uuidv4().replace(/-/g, ""); // Generating a random string without dashes
    const extension = imageName.split(".").pop(); // Extract extension from original file name
    return `${timestamp}_${randomString}.${extension}`;
  };

  public uploadImageToS3 = async (
    imageName: string,
    body: Buffer,
    contentType: string
  ) => {
    const uniqueImageName = this.generateUniqueImageName(imageName);

    const params: UploadImageParams = {
      Key: uniqueImageName,
      Body: body,
      ContentType: contentType,
    };

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      ...params,
    });
    await this.s3.send(command);
    return uniqueImageName;
  };

  public getImageUrlFromS3 = async (imageName: string) => {
    const params: DownloadImageParams = {
      Key: imageName,
    };
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      ...params,
    });

    const url = await getSignedUrl(this.s3, command, { expiresIn: 3600 });
    return url;
  };

  public deleteImageFromS3 = async (imageName: string) => {
    const params: DeleteImageParams = {
      Key: imageName,
    };
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      ...params,
    });
    await this.s3.send(command);
  };
}

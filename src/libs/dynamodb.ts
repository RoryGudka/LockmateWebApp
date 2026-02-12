import AWS from "aws-sdk";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

AWS.config.update({
  region: process.env.AWS_REGION || "",
  accessKeyId: process.env.AWS_IAM_ACCESS_KEY_ID || "",
  secretAccessKey: process.env.AWS_IAM_SECRET_ACCESS_KEY || "",
});

export const dynamodb = DynamoDBDocument.from(
  new DynamoDB({
    region: process.env.AWS_REGION || "",
    credentials: {
      accessKeyId: process.env.AWS_IAM_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.AWS_IAM_SECRET_ACCESS_KEY || "",
    },
  }),
);

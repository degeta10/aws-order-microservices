import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const TABLE_NAME = process.env.TABLE_NAME!;

const client = new DynamoDBClient({
  region: process.env.REGION,
});

const docClient = DynamoDBDocumentClient.from(client);

export class UserModel {
  public userId: string;
  public email: string;
  public fullName: string;
  public createdAt: string;

  constructor(userId: string, email: string, fullName: string) {
    this.userId = userId;
    this.email = email;
    this.fullName = fullName;
    this.createdAt = new Date().toISOString();
  }

  async save(): Promise<void> {
    const params = {
      TableName: TABLE_NAME,
      Item: {
        userId: this.userId,
        email: this.email,
        fullName: this.fullName,
        createdAt: this.createdAt,
      },
    };

    try {
      await docClient.send(new PutCommand(params));
    } catch (error) {
      console.error("DynamoDB Save Error:", error);
      throw error;
    }
  }
}

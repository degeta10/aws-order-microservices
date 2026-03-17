import { APIGatewayProxyEvent } from "aws-lambda";
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { UserModel } from "../models/UserModel";
import { apiHandler, ApiResponse } from "shared";

const client = new CognitoIdentityProviderClient({
  region: process.env.REGION,
});
const CLIENT_ID = process.env.CLIENT_ID!;

const baseSignUp = async (event: APIGatewayProxyEvent) => {
  interface SignUpBody {
    email?: string;
    password?: string;
    fullName?: string;
  }
  const { email, password, fullName } = event.body as unknown as SignUpBody;

  if (!email || !password || !fullName) {
    return ApiResponse.validationError({
      email: email ? "Email is required" : null,
      password: password ? "Password is required" : null,
      fullName: fullName ? "Full name is required" : null,
    });
  }

  const params = {
    ClientId: CLIENT_ID,
    Username: email,
    Password: password,
    UserAttributes: [
      { Name: "email", Value: email },
      { Name: "name", Value: fullName },
    ],
  };

  try {
    const command = new SignUpCommand(params);
    const cognitoResponse = await client.send(command);
    const cognitoUserId = cognitoResponse.UserSub;

    if (!cognitoUserId) {
      throw new Error("Failed to retrieve user ID from Cognito");
    }

    const newUser = new UserModel(cognitoUserId, email, fullName);
    await newUser.save();

    return ApiResponse.created(
      { userId: cognitoUserId },
      "Account created, please verify your email!",
    );
  } catch (error: any) {
    if (error.name === "UsernameExistsException") {
      return ApiResponse.badRequest(
        "An account with this email already exists",
      );
    }

    return ApiResponse.internalError(error.message || "Sign-up failed");
  }
};

export const handler = apiHandler(baseSignUp);

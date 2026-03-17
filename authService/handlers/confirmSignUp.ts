import { APIGatewayProxyEvent } from "aws-lambda";
import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
  AdminGetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { apiHandler, ApiResponse } from "shared";

const client = new CognitoIdentityProviderClient({
  region: process.env.REGION,
});
const CLIENT_ID = process.env.CLIENT_ID!;
const USER_POOL_ID = process.env.USER_POOL_ID!;

const baseConfirmSignUp = async (event: APIGatewayProxyEvent) => {
  interface ConfirmSignUpBody {
    email?: string;
    confirmationCode?: string;
  }
  const { email, confirmationCode } =
    event.body as unknown as ConfirmSignUpBody;

  if (!email || !confirmationCode) {
    return ApiResponse.validationError({
      email: email ? "Email is required" : null,
      confirmationCode: confirmationCode
        ? "Confirmation code is required"
        : null,
    });
  }

  const confirmParams = {
    ClientId: CLIENT_ID,
    Username: email,
    ConfirmationCode: confirmationCode,
  };

  try {
    await client.send(new ConfirmSignUpCommand(confirmParams));

    const userData = await client.send(
      new AdminGetUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: email,
      }),
    );

    const subAttr = userData.UserAttributes?.find(
      (attr: any) => attr.Name === "sub",
    );
    const userId = subAttr?.Value;

    if (!userId) {
      throw new Error("User ID (sub) not found in Cognito attributes.");
    }

    return ApiResponse.success(
      { userId },
      "User successfully confirmed and updated!",
    );
  } catch (error: any) {
    if (error.name === "CodeMismatchException") {
      return ApiResponse.badRequest(
        "Invalid verification code provided, please try again.",
      );
    }
    if (error.name === "ExpiredCodeException") {
      return ApiResponse.badRequest(
        "Verification code has expired, please request a new one.",
      );
    }
    if (error.name === "NotAuthorizedException") {
      return ApiResponse.badRequest("User is already confirmed.");
    }

    return ApiResponse.internalError(error.message || "Confirmation failed");
  }
};

export const handler = apiHandler(baseConfirmSignUp);

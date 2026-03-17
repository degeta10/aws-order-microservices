import { APIGatewayProxyEvent } from "aws-lambda";
import {
  CognitoIdentityProviderClient,
  GlobalSignOutCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { apiHandler, ApiResponse } from "shared";

const client = new CognitoIdentityProviderClient({
  region: process.env.REGION,
});

const baseSignOut = async (event: APIGatewayProxyEvent) => {
  const authHeader =
    event.headers?.authorization || event.headers?.Authorization;

  if (!authHeader) {
    return ApiResponse.unauthorized(
      "Missing Authorization header. Cannot sign out.",
    );
  }

  const accessToken = authHeader.replace("Bearer ", "").trim();

  if (!accessToken) {
    return ApiResponse.unauthorized("Invalid token format.");
  }

  const params = {
    AccessToken: accessToken,
  };

  try {
    const command = new GlobalSignOutCommand(params);
    await client.send(command);

    return ApiResponse.success(null, "User successfully signed out!");
  } catch (error: any) {
    console.error("SignOut Error:", error);

    if (error.name === "NotAuthorizedException") {
      return ApiResponse.unauthorized(
        "Session has already expired or token is invalid.",
      );
    }

    return ApiResponse.internalError(error.message || "Sign-out failed");
  }
};

export const handler = apiHandler(baseSignOut);

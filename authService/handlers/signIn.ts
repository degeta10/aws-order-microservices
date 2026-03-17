import { APIGatewayProxyEvent } from "aws-lambda";
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { apiHandler, ApiResponse } from "shared";

const client = new CognitoIdentityProviderClient({
  region: process.env.REGION,
});

const CLIENT_ID = process.env.CLIENT_ID!;

const baseSignIn = async (event: APIGatewayProxyEvent) => {
  interface SignInBody {
    email?: string;
    password?: string;
  }

  const { email, password } = event.body as unknown as SignInBody;

  if (!email || !password) {
    return ApiResponse.validationError({
      email: email ? "Email is required" : null,
      password: password ? "Password is required" : null,
    });
  }

  const params = {
    ClientId: CLIENT_ID,
    AuthFlow: "USER_PASSWORD_AUTH",
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  };

  try {
    const command = new InitiateAuthCommand(params);
    const response = await client.send(command);

    const authData = {
      tokenType: response.AuthenticationResult?.TokenType,
      accessToken: response.AuthenticationResult?.AccessToken,
      refreshToken: response.AuthenticationResult?.RefreshToken,
      idToken: response.AuthenticationResult?.IdToken,
    };

    return ApiResponse.success(authData, "User successfully signed in!");
  } catch (error: any) {
    if (
      error.name === "NotAuthorizedException" ||
      error.name === "UserNotFoundException"
    ) {
      return ApiResponse.unauthorized("Invalid email or password.");
    }

    return ApiResponse.internalError(error.message || "Sign-in failed");
  }
};

export const handler = apiHandler(baseSignIn);

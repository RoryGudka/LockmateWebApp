import { CognitoIdentityServiceProvider } from "aws-sdk";
import { CognitoUserPool } from "amazon-cognito-identity-js";

const userPool = new CognitoUserPool({
  UserPoolId: process.env.USER_POOL_ID || "",
  ClientId: process.env.USER_POOL_CLIENT_ID || "",
});

const cognito = new CognitoIdentityServiceProvider({
  region: process.env.AWS_REGION || "",
});

export { userPool, cognito };

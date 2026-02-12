import { NextApiRequest, NextApiResponse } from "next";

import { CognitoUser } from "amazon-cognito-identity-js";
import { handleCors } from "../../../libs/cors";
import { userPool } from "../../../libs/cognito";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (handleCors(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;

  const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });

  cognitoUser.forgotPassword({
    onSuccess: function (data) {
      res.send({
        message: "Password reset successful, please check your email",
        data: data,
      });
    },
    onFailure: function (err) {
      res.status(400).send({ message: "Password reset failed", error: err });
    },
    inputVerificationCode: function (data) {
      res.send({ message: "Verification code sent", data: data });
    },
  });
}

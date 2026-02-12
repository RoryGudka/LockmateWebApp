import { NextApiRequest, NextApiResponse } from "next";

import { CognitoUser } from "amazon-cognito-identity-js";
import { handleCors } from "../../../libs/cors";
import { userPool } from "../../../libs/cognito";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (handleCors(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, confirmationCode } = req.body;

  console.log(email, confirmationCode);
  const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });

  cognitoUser.confirmRegistration(confirmationCode, true, (err, result) => {
    if (err) {
      console.log(err);
      res.status(400).json({ message: "Verification failed", error: err });
      return;
    }
    res.json({ message: "Verification successful", data: result });
  });
}

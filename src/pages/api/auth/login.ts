import { AuthenticationDetails, CognitoUser } from "amazon-cognito-identity-js";
import { NextApiRequest, NextApiResponse } from "next";

import { handleCors } from "../../../libs/cors";
import { userPool } from "../../../libs/cognito";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (handleCors(req, res)) return;
  console.log(req);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password } = req.body;

  const authenticationDetails = new AuthenticationDetails({
    Username: email,
    Password: password,
  });

  const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });

  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function (result) {
      res.send({ message: "Login successful", data: result });
    },
    onFailure: function (err) {
      console.log(err);
      res.status(400).send({ message: "Login failed", error: err });
    },
  });
}

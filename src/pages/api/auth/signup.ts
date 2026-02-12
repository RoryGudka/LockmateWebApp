import { NextApiRequest, NextApiResponse } from "next";

import { CognitoUserAttribute } from "amazon-cognito-identity-js";
import { handleCors } from "../../../libs/cors";
import { userPool } from "../../../libs/cognito";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (handleCors(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password } = req.body;

  const attributeList: CognitoUserAttribute[] = [];

  userPool.signUp(
    email,
    password,
    attributeList,
    attributeList,
    (err, result) => {
      if (err) {
        res.status(400).send({ message: "Signup failed", error: err });
        return;
      }
      res.send({ message: "Signup successful", data: result });
    },
  );
}

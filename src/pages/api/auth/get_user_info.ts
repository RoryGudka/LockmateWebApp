import { NextApiRequest, NextApiResponse } from "next";
import { validateToken } from "../../../libs/auth-helpers";
import { handleCors } from "../../../libs/cors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (handleCors(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { accessToken } = req.body;

    const details = await validateToken(res, accessToken);
    if (!details) return;

    const { email, username } = details;

    res.json({ email, username });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Unable to get user info." });
  }
}

import { NextApiRequest, NextApiResponse } from "next";
import {
  addAction,
  validateDevice,
  validateToken,
} from "../../../libs/auth-helpers";

import { handleCors } from "../../../libs/cors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (handleCors(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { deviceId, accessToken } = req.body;

  const details = await validateToken(res, accessToken);
  if (!details) return;

  const { email } = details;

  const device = await validateDevice(res, email, deviceId);
  if (!device) return;

  try {
    await addAction(deviceId, "set_unlocked_position");
    res.json({ message: "Unlocked position action added for the device." });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Unable to update the database." });
  }
}

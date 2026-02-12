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

  const { deviceId, networkId, networkPassword, accessToken } = req.body;

  const details = await validateToken(res, accessToken);
  if (!details) return;

  const { email } = details;

  const device = await validateDevice(res, email, deviceId);
  if (!device) return;

  try {
    await addAction(deviceId, "change_wifi_network", {
      networkId: networkId,
      networkPassword: networkPassword,
    });
    res.json({ message: "Change WiFi network action added for the device." });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Unable to update the database." });
  }
}

import { NextApiRequest, NextApiResponse } from "next";
import { validateDevice, validateToken } from "../../../libs/auth-helpers";

import { handleCors } from "../../../libs/cors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (handleCors(req, res)) return;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { accessToken, deviceId } = req.query as { [key: string]: string };

  const details = await validateToken(res, accessToken);
  if (!details) return;

  const { email } = details;

  const device = await validateDevice(res, email, deviceId);
  if (!device) return;

  if (device) {
    res.json({
      deviceId: device["deviceId"],
      ownerId: device["ownerId"] || null,
      linkedUserIds: device["linkedUserIds"] || [],
      guests: device["guests"] || [],
      isLocked: device["isLocked"],
      batteryStatus: device["batteryStatus"],
      isUnlockCalibrated: device["isUnlockCalibrated"],
      isLockCalibrated: device["isLockCalibrated"],
      lastUpdateTimestamp: device["lastUpdateTimestamp"],
      availableNetworks: device["availableNetworks"],
      connectedNetwork: device["connectedNetwork"],
    });
  } else {
    res.status(404).json({ error: "Invalid device id" });
  }
}

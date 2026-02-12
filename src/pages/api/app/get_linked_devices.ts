import { NextApiRequest, NextApiResponse } from "next";
import { getLinkedDevices, validateToken } from "../../../libs/auth-helpers";

import { handleCors } from "../../../libs/cors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (handleCors(req, res)) return;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { accessToken } = req.query as { [key: string]: string };

    const details = await validateToken(res, accessToken);
    if (!details) return;

    const { email } = details;

    const devices = await getLinkedDevices(email);
    console.log("get_linked_devices - email:", email);
    console.log("get_linked_devices - devices:", JSON.stringify(devices, null, 2));
    res.json({ devices });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Unable to get linked devices." });
  }
}

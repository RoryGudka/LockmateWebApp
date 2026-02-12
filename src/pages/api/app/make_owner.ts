import { NextApiRequest, NextApiResponse } from "next";
import { validateDevice, validateToken } from "../../../libs/auth-helpers";

import { dynamodb } from "../../../libs/dynamodb";
import { handleCors } from "../../../libs/cors";

const normalizeEmail = (value: string) => value.trim().toLowerCase();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (handleCors(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { deviceId, email, accessToken } = req.body as {
    deviceId?: string;
    email?: string;
    accessToken?: string;
  };

  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  const details = await validateToken(res, accessToken || "");
  if (!details) return;

  const { email: requesterEmail } = details;

  const device = await validateDevice(res, requesterEmail, deviceId || "");
  if (!device) return;

  // Only the current owner can transfer ownership
  if (device.ownerId && device.ownerId !== requesterEmail) {
    return res.status(403).json({ error: "Only the owner can transfer ownership." });
  }

  const normalizedEmail = normalizeEmail(email);

  try {
    const linkedUserIds = new Set(device.linkedUserIds || []);
    
    // Add new owner to linked users if not already there
    linkedUserIds.add(normalizedEmail);
    
    // Add previous owner to linked users if there was one
    if (device.ownerId) {
      linkedUserIds.add(device.ownerId);
    }

    // Remove new owner from guests if they were a guest
    const guests = (device.guests || []).filter(
      (g: any) => g.email !== normalizedEmail
    );

    await dynamodb.update({
      TableName: "LockmateDevices",
      Key: { deviceId: deviceId },
      UpdateExpression: "SET #ownerId = :ownerId, #linkedUserIds = :linkedUserIds, #guests = :guests",
      ExpressionAttributeNames: {
        "#ownerId": "ownerId",
        "#linkedUserIds": "linkedUserIds",
        "#guests": "guests",
      },
      ExpressionAttributeValues: {
        ":ownerId": normalizedEmail,
        ":linkedUserIds": Array.from(linkedUserIds),
        ":guests": guests,
      },
    });

    res.json({ ownerId: normalizedEmail, linkedUserIds: Array.from(linkedUserIds), guests });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Unable to update the database." });
  }
}

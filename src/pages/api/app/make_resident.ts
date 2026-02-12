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

  // Only owner and residents can make residents
  const isOwner = device.ownerId === requesterEmail;
  const isResident = (device.linkedUserIds || []).includes(requesterEmail);
  
  if (!isOwner && !isResident) {
    return res.status(403).json({ error: "Only owners and residents can make residents." });
  }

  const normalizedEmail = normalizeEmail(email);

  try {
    // Add to linked users
    const linkedUserIds = new Set(device.linkedUserIds || []);
    linkedUserIds.add(normalizedEmail);

    // Remove from guests
    const guests = (device.guests || []).filter(
      (g: any) => g.email !== normalizedEmail
    );

    await dynamodb.update({
      TableName: "LockmateDevices",
      Key: { deviceId: deviceId },
      UpdateExpression: "SET #linkedUserIds = :linkedUserIds, #guests = :guests",
      ExpressionAttributeNames: {
        "#linkedUserIds": "linkedUserIds",
        "#guests": "guests",
      },
      ExpressionAttributeValues: {
        ":linkedUserIds": Array.from(linkedUserIds),
        ":guests": guests,
      },
    });

    res.json({ linkedUserIds: Array.from(linkedUserIds), guests });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Unable to update the database." });
  }
}

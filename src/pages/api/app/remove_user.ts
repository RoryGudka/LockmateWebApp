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

  const normalizedEmail = normalizeEmail(email);

  // Don't allow removing the owner
  if (device.ownerId === normalizedEmail) {
    return res.status(403).json({ error: "Cannot remove the owner. Transfer ownership first." });
  }

  // Permission checks:
  const isOwner = device.ownerId === requesterEmail;
  const isResident = (device.linkedUserIds || []).includes(requesterEmail);
  const isGuest = (device.guests || []).some((g: any) => g.email === requesterEmail);
  const targetIsGuest = (device.guests || []).some((g: any) => g.email === normalizedEmail);
  const isRemovingSelf = normalizedEmail === requesterEmail;

  // Guests can't remove anyone
  if (isGuest) {
    return res.status(403).json({ error: "Guests cannot remove users." });
  }

  // Residents can only remove guests or themselves
  if (isResident && !isOwner) {
    if (!targetIsGuest && !isRemovingSelf) {
      return res.status(403).json({ error: "Residents can only remove guests or themselves." });
    }
  }

  // Owner can remove anyone except themselves
  // (already checked above for owner removal)

  try {
    // Remove from linked users
    const linkedUserIds = (device.linkedUserIds || []).filter(
      (id: string) => id !== normalizedEmail
    );

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
        ":linkedUserIds": linkedUserIds,
        ":guests": guests,
      },
    });

    res.json({ linkedUserIds, guests });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Unable to update the database." });
  }
}

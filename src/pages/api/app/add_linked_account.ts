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

  // Only owner and residents can add residents (unless it's the first user)
  if (device.ownerId) {
    const isOwner = device.ownerId === requesterEmail;
    const isResident = (device.linkedUserIds || []).includes(requesterEmail);
    
    if (!isOwner && !isResident) {
      return res.status(403).json({ error: "Only owners and residents can add residents." });
    }
  }

  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail.includes("@")) {
    return res.status(400).json({ error: "Invalid email address." });
  }

  try {
    const existingItems = new Set(device.linkedUserIds || []);
    existingItems.add(normalizedEmail);

    // If there's no owner yet, set the first linked user as owner
    const updateExpression = !device.ownerId
      ? "SET #linkedUserIds = :userIdsValue, #ownerId = :ownerId"
      : "SET #linkedUserIds = :userIdsValue";

    const expressionAttributeNames: any = {
      "#linkedUserIds": "linkedUserIds",
    };

    const expressionAttributeValues: any = {
      ":userIdsValue": Array.from(existingItems),
    };

    if (!device.ownerId) {
      expressionAttributeNames["#ownerId"] = "ownerId";
      expressionAttributeValues[":ownerId"] = normalizedEmail;
    }

    await dynamodb.update({
      TableName: "LockmateDevices",
      Key: { deviceId: deviceId },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    });

    res.json({ 
      linkedUserIds: Array.from(existingItems),
      ownerId: device.ownerId || normalizedEmail
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Unable to update the database." });
  }
}

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

  const { deviceId, email, startTime, expirationTime, accessToken } = req.body as {
    deviceId?: string;
    email?: string;
    startTime?: string;
    expirationTime?: string | null;
    accessToken?: string;
  };

  if (!email || !startTime) {
    return res.status(400).json({ error: "Email and start time are required." });
  }

  const details = await validateToken(res, accessToken || "");
  if (!details) return;

  const { email: requesterEmail } = details;

  const device = await validateDevice(res, requesterEmail, deviceId || "");
  if (!device) return;

  // Only owner and residents can update guest access
  const isOwner = device.ownerId === requesterEmail;
  const isResident = (device.linkedUserIds || []).includes(requesterEmail);
  
  if (!isOwner && !isResident) {
    return res.status(403).json({ error: "Only owners and residents can update guest access." });
  }

  const normalizedEmail = normalizeEmail(email);

  try {
    const existingGuests = device.guests || [];
    
    // Find and update the guest
    const updatedGuests = existingGuests.map((guest: any) => {
      if (guest.email === normalizedEmail) {
        return {
          email: normalizedEmail,
          startTime,
          expirationTime,
        };
      }
      return guest;
    });

    // If guest not found, return error
    if (JSON.stringify(existingGuests) === JSON.stringify(updatedGuests)) {
      return res.status(404).json({ error: "Guest not found." });
    }

    await dynamodb.update({
      TableName: "LockmateDevices",
      Key: { deviceId },
      UpdateExpression: "SET #guests = :guests",
      ExpressionAttributeNames: {
        "#guests": "guests",
      },
      ExpressionAttributeValues: {
        ":guests": updatedGuests,
      },
    });

    console.log("Updated guest access:", updatedGuests);
    res.json({ guests: updatedGuests });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Unable to update guest access." });
  }
}

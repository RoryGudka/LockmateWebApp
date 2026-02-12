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

  // Only owner and residents can add guests
  const isOwner = device.ownerId === requesterEmail;
  const isResident = (device.linkedUserIds || []).includes(requesterEmail);
  
  if (!isOwner && !isResident) {
    return res.status(403).json({ error: "Only owners and residents can add guests." });
  }

  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail.includes("@")) {
    return res.status(400).json({ error: "Invalid email address." });
  }

  try {
    const existingGuests = device.guests || [];
    
    // Remove any existing guest entry for this email
    const filteredGuests = existingGuests.filter((g: any) => g.email !== normalizedEmail);
    
    // Add new guest
    const newGuest = {
      email: normalizedEmail,
      startTime,
      expirationTime: expirationTime || null,
    };
    
    filteredGuests.push(newGuest);

    await dynamodb.update({
      TableName: "LockmateDevices",
      Key: { deviceId: deviceId },
      UpdateExpression: "SET #guests = :guestsValue",
      ExpressionAttributeNames: {
        "#guests": "guests",
      },
      ExpressionAttributeValues: {
        ":guestsValue": filteredGuests,
      },
    });

    console.log("add_guest_account - Added guest:", newGuest);
    console.log("add_guest_account - All guests:", filteredGuests);
    res.json({ guests: filteredGuests });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Unable to update the database." });
  }
}

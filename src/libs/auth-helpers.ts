import { CognitoJwtVerifier } from "aws-jwt-verify";
import { NextApiResponse } from "next";
import { cognito } from "./cognito";
import { dynamodb } from "./dynamodb";

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.USER_POOL_ID || "",
  clientId: process.env.USER_POOL_CLIENT_ID || "",
  tokenUse: "access",
});

export const validateToken = async (res: NextApiResponse, token: string) => {
  try {
    if (!token) {
      res.status(401).json({ error: "Access token is missing." });
      return null;
    }

    const { username } = await verifier.verify(token);
    const user = await cognito.getUser({ AccessToken: token }).promise();
    const email = user.UserAttributes?.find(
      (attr) => attr.Name === "email",
    )?.Value;

    if (!email) {
      res.status(500).json({ error: "Email for access token not found" });
      return null;
    }

    return { username, email };
  } catch (error) {
    res.status(401).json({ error: "Invalid access token." });
    return null;
  }
};

export const getLinkedDevices = async (userId: string) => {
  const devices = (
    await dynamodb.scan({
      TableName: "LockmateDevices",
    })
  ).Items;

  if (!devices) return [];

  const now = new Date().toISOString();
  console.log(now);

  // Filter devices where user is owner, linked user, or active guest
  const linkedDevices = devices.filter((device: any) => {
    // Check if user is owner
    if (device.ownerId === userId) return true;

    // Check if user is in linked users
    if (device.linkedUserIds && device.linkedUserIds.includes(userId))
      return true;

    // Check if user is an active guest
    if (device.guests && Array.isArray(device.guests)) {
      return device.guests.some((guest: any) => {
        if (guest.email !== userId) return false;

        const nowDate = new Date(now);

        // Check if access has started
        if (guest.startTime) {
          const startDate = new Date(guest.startTime);
          if (startDate > nowDate) {
            console.log(
              `Guest ${guest.email} access not started yet. Start: ${guest.startTime}, Now: ${now}`,
            );
            return false;
          }
        }

        // Check if access has expired
        if (guest.expirationTime) {
          const expirationDate = new Date(guest.expirationTime);
          if (expirationDate < nowDate) {
            console.log(
              `Guest ${guest.email} access expired. Expiration: ${guest.expirationTime}, Now: ${now}`,
            );
            return false;
          }
        }

        console.log(`Guest ${guest.email} has valid access`);
        return true;
      });
    }

    return false;
  });

  return linkedDevices;
};

export const validateDevice = async (
  res: NextApiResponse,
  userId: string,
  deviceId: string,
) => {
  try {
    if (!deviceId) {
      res.status(401).json({ error: "Device id is missing." });
      return null;
    }

    const devices = await getLinkedDevices(userId);
    if (!devices) {
      res.status(500).json({ error: "No linked devices found." });
      return null;
    }

    const device = devices.find((device: any) => device.deviceId === deviceId);
    if (!device) {
      res.status(500).json({ error: `Device ${deviceId} not linked.` });
      return null;
    }

    return device as any;
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Unable to validate device." });
    return null;
  }
};

export const addAction = async (
  deviceId: string,
  action: string,
  params?: { [key: string]: string },
) => {
  const timestamp = new Date().toISOString();
  await dynamodb.put({
    TableName: "LockmateActions",
    Item: {
      deviceId,
      timestamp,
      action,
      ...(params || {}),
    },
  });
};

export const validateSecretKey = async (
  res: NextApiResponse,
  deviceId: string,
  secretKey: string,
) => {
  try {
    if (!secretKey) {
      res.send(`{"status": "ERROR"}`);
      return null;
    }

    const device = await dynamodb.get({
      TableName: "LockmateDevices",
      Key: { deviceId },
    });

    if (!device || !device.Item || device.Item.deviceSecretKey != secretKey) {
      res.send(`{"status": "ERROR"}`);
      return null;
    }

    return device.Item;
  } catch (e) {
    console.error(e);
    res.send(`{"status": "ERROR"}`);
    return null;
  }
};

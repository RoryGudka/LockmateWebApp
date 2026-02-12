import { NextApiRequest, NextApiResponse } from "next";

import { dynamodb } from "../../../libs/dynamodb";
import { handleCors } from "../../../libs/cors";
import { sendText } from "../../../libs/api";
import { validateSecretKey } from "../../../libs/auth-helpers";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (handleCors(req, res)) return;

  if (req.method !== "GET") {
    return sendText(res, 405, "ERROR - Method not allowed");
  }

  const deviceId = req.query.device_id as string;
  const secretKey = req.query.secret_key as string;
  const availableNetworks = [
    ...new Set(
      (req.query.available_networks as string)
        ?.split(",")
        .filter((val) => val) || [],
    ),
  ];

  try {
    const device = await validateSecretKey(res, deviceId, secretKey);
    if (!device) return;

    await dynamodb.update({
      TableName: "LockmateDevices",
      Key: { deviceId },
      UpdateExpression:
        "SET availableNetworks = :availableNetworks, lastUpdateTimestamp = :timestamp",
      ExpressionAttributeValues: {
        ":timestamp": new Date().toISOString(),
        ":availableNetworks": availableNetworks,
      },
    });

    return sendText(res, 200, `OK`);
  } catch (error) {
    console.error("Error:", error);
    return sendText(res, 500, `ERROR - ${error}`);
  }
}

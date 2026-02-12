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
  const isLocked = req.query.is_locked as string;
  const batteryStatus = req.query.battery_status as string;
  const isUnlockCalibrated = req.query.is_unlock_calibrated as string;
  const isLockCalibrated = req.query.is_lock_calibrated as string;
  const connectedNetwork = req.query.connected_network as string;

  try {
    const device = await validateSecretKey(res, deviceId, secretKey);
    if (!device) return;

    await dynamodb.update({
      TableName: "LockmateDevices",
      Key: { deviceId },
      UpdateExpression:
        "SET isLocked = :isLocked, batteryStatus = :batteryStatus, isUnlockCalibrated = :isUnlockCalibrated, isLockCalibrated = :isLockCalibrated, lastUpdateTimestamp = :timestamp, connectedNetwork = :connectedNetwork",
      ExpressionAttributeValues: {
        ":timestamp": new Date().toISOString(),
        ":isLocked": isLocked === "T",
        ":isUnlockCalibrated": isUnlockCalibrated === "T",
        ":isLockCalibrated": isLockCalibrated === "T",
        ":connectedNetwork": connectedNetwork,
        ":batteryStatus":
          batteryStatus === "H"
            ? "high"
            : batteryStatus === "M"
              ? "medium"
              : "low",
      },
    });

    const result = await dynamodb.query({
      TableName: "LockmateActions",
      KeyConditionExpression: "deviceId = :deviceId",
      ExpressionAttributeValues: { ":deviceId": deviceId },
      ScanIndexForward: false,
      Limit: 1,
    });

    if (result && result.Count && result.Items && result.Items[0]) {
      const mostRecentAction = result.Items[0].action;

      await Promise.all(
        result.Items.map(async (item) => {
          await dynamodb.delete({
            TableName: "LockmateActions",
            Key: { deviceId: deviceId, timestamp: item.timestamp },
          });
        }),
      );
      return sendText(res, 200, mostRecentAction);
    } else {
      return sendText(res, 200, `none`);
    }
  } catch (error) {
    console.error("Error:", error);
    return sendText(res, 500, `ERROR - ${error}`);
  }
}

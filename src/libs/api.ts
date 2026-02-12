import { NextApiResponse } from "next";

export const sendText = (
  res: NextApiResponse,
  statusCode: number,
  text: string,
) => {
  res.status(statusCode).send(text);
};

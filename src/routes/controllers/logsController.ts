import express, { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";

// const app = express();
export const logsController = Router();

// Путь к лог-файлу
const backendFilePath = path.join(__dirname, "../requests.log");
const iosFilePath = path.join(__dirname, "../requests_ios.log");

// Маршрут для отображения логов
logsController.get("/", async (req: Request, res: Response) => {
  try {
    res.download(backendFilePath, "requests.log", (err) => {
      if (err) {
        res.status(500).send(err);
      }
    });
  } catch (err) {
    res.status(500).send(err);
  }
});

logsController.post("/", async (req: Request, res: Response) => {
  const { message } = req.body; // Assuming the user sends a JSON object with a "message" key

  if (!message || typeof message !== "string") {
    return res
      .status(400)
      .send("Invalid message format. Please send a string.");
  }

  try {
    await fs.promises.appendFile(iosFilePath, `${message}\n`); // Append message with newline for separation
    return res.sendStatus(200);
  } catch (err) {
    return res.sendStatus(500);
  }
});

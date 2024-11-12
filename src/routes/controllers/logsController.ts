import express, { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";

// const app = express();
export const logsController = Router();
const PORT = 3000;
console.log(PORT);

// Путь к лог-файлу
const logFilePath = path.join(__dirname, "requests.log");
console.log(logFilePath);

// Маршрут для отображения логов
logsController.get("/logs", (req: Request, res: Response) => {
  console.log(logFilePath, PORT);
  fs.readFile(logFilePath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).send("Ошибка при чтении лог-файла");
    }
    res.type("text/plain").send(data);
  });
});

// logsController.post("/logs", async (req: Request, res: Response) => {
//   try {
//     const data = await fs.readFile(logFilePath, "utf8");
//     res.type("text/plain").send(data);
//   } catch (err) {
//     res.status(500).send("Ошибка при чтении лог-файла");
//   }
// });

// logsController.listen(PORT, () => {
//   console.log(`Сервер запущен на порту ${PORT}`);
// });

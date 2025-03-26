import admin from "firebase-admin";
import * as path from "path";
import * as fs from "fs";

// Путь к файлу JSON с ключами
const pathToAndroidKey = path.join(
  __dirname,
  "/keys/AndroidPushNotificationsKey.json"
);

// Чтение файла JSON и преобразование его в объект
const androidKey = JSON.parse(fs.readFileSync(pathToAndroidKey, "utf8"));

// Инициализация Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(androidKey),
});

const messaging = admin.messaging();

export const sendAndroidPushNotification = async (
  deviceToken: string,
  title: string,
  body: string
) => {
  try {
    const message = {
      notification: {
        title: title,
        body: body,
      },
      token: deviceToken,
    };

    const response = await messaging.send(message);
    console.log("Успешно отправлено:", response);
  } catch (error) {
    console.error("Ошибка при отправке уведомления:", error);
  }
};

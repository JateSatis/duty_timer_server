import * as apn from "apn";
import path from "path";

const pathToKey = path.join(__dirname, "/keys/AuthKey_446RHJM4H9.p8");

// Конфигурация APNs
const options: apn.ProviderOptions = {
  token: {
    key: pathToKey, // Путь к вашему AuthKey файлу
    keyId: "446RHJM4H9", // Key ID
    teamId: "TK8B7U943D", // Замените на ваш Team ID
  },
  production: false, // Используйте false для тестового окружения, true для продакшна
};

// Создание провайдера APNs
const apnProvider = new apn.Provider(options);

/**
 * Отправка push-уведомления на устройство
 * @param deviceToken - Device token устройства
 * @param message - Текст уведомления
 */
export const sendApplePushNotification = async (
  deviceToken: string,
  message: string
): Promise<void> => {
  try {
    console.log(`deviceTekon: ${deviceToken}`);
    console.log(`message: ${message}`);

    // Создание объекта уведомления
    const notification = new apn.Notification();
    notification.expiry = Math.floor(Date.now() / 1000) + 3600; // Установка срока действия уведомления (1 час)
    notification.badge = 1; // Увеличение значка уведомлений на 1
    notification.sound = "default"; // Звук по умолчанию
    notification.alert = message; // Текст уведомления
    notification.topic = "ankh.DMBapp"; // Bundle ID вашего приложения

    // Отправка уведомления
    const response = await apnProvider.send(notification, deviceToken);

    if (response.failed.length > 0) {
      console.error("Неудачные попытки отправки:", response.failed);
    }

    if (response.sent.length > 0) {
      console.log("Успешно отправлено:", response.sent);
    }
  } catch (error) {
    console.error("Ошибка при отправке уведомления:", error);
  }
};

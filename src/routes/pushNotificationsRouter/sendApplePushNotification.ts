import * as apn from "apn";

// Конфигурация APNs
const options: apn.ProviderOptions = {
  token: {
    key: "./path/to/AuthKey_446RHJM4H9.p8", // Путь к вашему AuthKey файлу
    keyId: "446RHJM4H9", // Key ID
    teamId: "YOUR_TEAM_ID", // Замените на ваш Team ID
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

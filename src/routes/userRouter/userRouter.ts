//# --- LIBS ---
import { NextFunction, Request, Response, Router } from "express";
import rateLimit, { RateLimitExceededEventHandler } from "express-rate-limit";

//# --- AUTH ---
import { auth } from "../../auth/authMiddleware";

//# --- ROUTES ---
import { getUserById } from "./getUserById/getUserById";
import { getUserInfo } from "./getUserInfo/getUserInfo";
import { setStatusOnline } from "./setStatusOnline/setStatusOnline";
import { setStatusOffline } from "./setStatusOffline/setStatusOffline";
import { getUsersByNickname } from "./getUsersByNickname/getUsersByNickname";
import { postAvatar } from "./postAvatar/postAvatar";
import { getAvatarLink } from "./getAvatarLink/getAvatarLink";
import { deleteAvatar } from "./deleteAvatar/deleteAvatar";
import { updateSettings } from "./updateSettings.ts/updateSettings";
import { getSettings } from "./getSettings/getSettings";
import { getFilesMiddleware } from "../utils/handleFiles/handleFilesMiddleware";
import { uploadBackgroundImage } from "./uploadBackgroundImage/uploadBackgroundImage";

//# --- ERRORS ---
import { err, RATE_LIMIT_EXCEEDED } from "../utils/errors/GlobalErrors";
import { deleteBackgroundImage } from "./deleteBackgroundImage/deleteBackgroundImage";
import { setUserType } from "./setUserType/setUserType";

const rateLimitExceededHandler: RateLimitExceededEventHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return res.status(429).json(err(new RATE_LIMIT_EXCEEDED()));
};

const userLimiter = rateLimit({
  windowMs: 60 * 1000, // # One minite time
  limit: 20,
  handler: rateLimitExceededHandler,
  validate: {
    xForwardedForHeader: false,
  },
});

export const userRouter = Router();

userRouter.use(userLimiter);

//# Swagger описание тега User
/**
 * @swagger
 * tags:
 *   name: User
 *   description: Ручки для просмотра и управления данными аккаунта
 */

//# Swagger описание запроса getUserInfo
/**
 * @swagger
 * /user/:
 *   get:
 *     summary: Получить данные своего аккаунта
 *     description: Используется для того, чтобы посмотреть данные своего собственного аккаунта
 *     tags: [User]
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Данные пользователя успешно найдены
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/getUserInfoResponse'
 *       500:
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/DATABASE_ERROR'
 *                 - $ref: '#/components/schemas/S3_STORAGE_ERROR'
 *             examples:
 *               DATABASE_ERROR:
 *                 $ref: "#/components/examples/DATABASE_ERROR_EXAMPLE"
 *               S3_STORAGE_ERROR:
 *                 $ref: "#/components/examples/S3_STORAGE_ERROR_EXAMPLE"
 *       404:
 *         description: Ошибка - данные не найдены
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DATA_NOT_FOUND'
 */
userRouter.get("/", auth, getUserInfo);

//# Swagger описание запроса setStatusOnline
/**
 * @swagger
 * /user/set-status-online:
 *   put:
 *     summary: Установить статус пользователя в состояние "online"
 *     description: Используется для того, чтобы при входе пользователя в аккаунта, установить его статус в значение "online"
 *     tags: [User]
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Статус пользователя успешно обновлен
 *       400:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DATABASE_ERROR'
 */
userRouter.put("/set-status-online", auth, setStatusOnline);

//# Swagger описание запроса setStatusOffline
/**
 * @swagger
 * /user/set-status-offline:
 *   put:
 *     summary: Установить статус пользователя в состояние "online"
 *     description: Используется для того, чтобы при входе пользователя в аккаунта, установить его статус в значение "online"
 *     tags: [User]
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Статус пользователя успешно обновлен
 *       400:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DATABASE_ERROR'
 */
userRouter.put("/set-status-offline", auth, setStatusOffline);

//# Swagger описание запроса getUserById
/**
 * @swagger
 * /user/id/{foreignUserId}:
 *   get:
 *     summary: Получение информации об аккаунте другого пользователя
 *     description: По данному запросу можно получить данные аккаунта пользователя по его UUID
 *     tags: [User]
 *     parameters:
 *       - name: foreignUserId
 *         description: UUID другого пользователя
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Данные другого пользователя успешно получены
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/getUserByIdResponse'
 *       400:
 *         description: Параметр не был передан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EMPTY_PARAMETER'
 *       403:
 *         description: Пользователь не имеет доступа к этим данным
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FORBIDDEN_ACCESS'
 *       404:
 *         description: Необходимые данные не найдены в базе данных
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DATA_NOT_FOUND'
 *       500:
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/DATABASE_ERROR'
 *                 - $ref: '#/components/schemas/UNKNOWN_ERROR'
 *             examples:
 *               DATABASE_ERROR:
 *                 $ref: "#/components/examples/DATABASE_ERROR_EXAMPLE"
 *               UNKNOWN_ERROR:
 *                 $ref: "#/components/examples/UNKNOWN_ERROR_EXAMPLE"
 */
userRouter.get("/id/:foreignUserId", auth, getUserById);

//# Swagger описание запроса getUsersByNickname
/**
 * @swagger
 * /user/id/{userNickname}:
 *   get:
 *     summary: Получение списка пользователей по никнейму
 *     description: По данному запросу можно получить список пользователей, чей никнейм соответствует переданной строке
 *     tags: [User]
 *     parameters:
 *       - name: userNickname
 *         description: Никнейм другого пользователя
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Список пользователь успешно получен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/getUsersByNicknameResponse'
 *       400:
 *         description: Параметр не был передан
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/INVALID_PARAMETER_FORMAT'
 *                 - $ref: '#/components/schemas/EMPTY_PARAMETER'
 *             examples:
 *               INVALID_PARAMETER_FORMAT:
 *                 $ref: '#/components/examples/INVALID_PARAMETER_FORMAT_EXAMPLE'
 *               EMPTY_PARAMETER:
 *                 $ref: '#/components/examples/EMPTY_PARAMETER_EXAMPLE'
 *       404:
 *         description: Необходимые данные не найдены в базе данных
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DATA_NOT_FOUND'
 *       500:
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/DATABASE_ERROR'
 *                 - $ref: '#/components/schemas/UNKNOWN_ERROR'
 *             examples:
 *               DATABASE_ERROR:
 *                 $ref: '#/components/examples/DATABASE_ERROR_EXAMPLE'
 *               UNKNOWN_ERROR:
 *                 $ref: '#/components/examples/UNKNOWN_ERROR_EXAMPLE'
 */
userRouter.get("/nickname/:userNickname", auth, getUsersByNickname);

//# Swagger описание запроса postAvatar
/**
 * @swagger
 * /user/avatar:
 *   post:
 *     summary: Отправление фото для установки на аватарку
 *     description: По данному запросу можно отправить фото, которое будет установленно на аватарку пользователя
 *     tags: [User]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/postAvatarRequest'
 *     responses:
 *       200:
 *         description: Аватарка успешно установлена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/postAvatarResponse'
 *       400:
 *         description: Файл не был отправлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MISSING_FILE'
 *       500:
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/DATABASE_ERROR'
 *                 - $ref: '#/components/schemas/S3_STORAGE_ERROR'
 *             examples:
 *               DATABASE_ERROR:
 *                 $ref: "#/components/examples/DATABASE_ERROR_EXAMPLE"
 *               UNKNOWN_ERROR:
 *                 $ref: "#/components/examples/S3_STORAGE_ERROR_EXAMPLE"
 */
userRouter.post("/avatar", getFilesMiddleware(1), auth, postAvatar);

//# Swagger описание запроса getAvatarLink
/**
 * @swagger
 * /user/avatar:
 *   get:
 *     summary: Получение ссылки на аватарку пользователя
 *     description: По данному запросу можно получить ссылку на свою аватарку
 *     tags: [User]
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Ссылка на аватарку успешно получена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/getAvatarLinkResponse'
 *       404:
 *         description: Необходимые данные не найдены в базе данных
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DATA_NOT_FOUND'
 *       500:
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/DATABASE_ERROR'
 *                 - $ref: '#/components/schemas/S3_STORAGE_ERROR'
 *             examples:
 *               DATABASE_ERROR:
 *                 $ref: "#/components/examples/DATABASE_ERROR_EXAMPLE"
 *               UNKNOWN_ERROR:
 *                 $ref: "#/components/examples/S3_STORAGE_ERROR_EXAMPLE"
 */
userRouter.get("/avatar", auth, getAvatarLink);

//# Swagger описание запроса deleteAvatar
/**
 * @swagger
 * /user/avatar:
 *   delete:
 *     summary: Удаление аватарки пользователя
 *     description: По данному запросу можно удалить собственную аватарку
 *     tags: [User]
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Аватарка успешно удалена
 *       404:
 *         description: Необходимые данные не найдены в базе данных
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DATA_NOT_FOUND'
 *       500:
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/DATABASE_ERROR'
 *                 - $ref: '#/components/schemas/S3_STORAGE_ERROR'
 *             examples:
 *               DATABASE_ERROR:
 *                 $ref: "#/components/examples/DATABASE_ERROR_EXAMPLE"
 *               UNKNOWN_ERROR:
 *                 $ref: "#/components/examples/S3_STORAGE_ERROR_EXAMPLE"
 */
userRouter.delete("/avatar", auth, deleteAvatar);

//# Swagger описание запроса getSettings
/**
 * @swagger
 * /user/settings:
 *   get:
 *     summary: Получение списка настроек приложения
 *     description: По данному запросу можно получить все настройки, устрановленные пользователем
 *     tags: [User]
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Настройки успешно получены
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/getSettingsResponse'
 *       404:
 *         description: Необходимые данные не найдены в базе данных
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DATA_NOT_FOUND'
 *       500:
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/DATABASE_ERROR'
 *                 - $ref: '#/components/schemas/S3_STORAGE_ERROR'
 *             examples:
 *               DATABASE_ERROR:
 *                 $ref: "#/components/examples/DATABASE_ERROR_EXAMPLE"
 *               UNKNOWN_ERROR:
 *                 $ref: "#/components/examples/S3_STORAGE_ERROR_EXAMPLE"
 */
userRouter.get("/settings", auth, getSettings);

//# Swagger описание запроса updateSettings
/**
 * @swagger
 * /user/settings:
 *   put:
 *     summary: Обновление настроек
 *     description: По данному запросу можно свои настройки приложения
 *     tags: [User]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/updateSettingsRequest'
 *     responses:
 *       200:
 *         description: Настройки успешно обновлены
 *       400:
 *         description: Ошибка при получении данных от клиента
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/MISSING_REQUEST_FIELD'
 *                 - $ref: '#/components/schemas/EMPTY_FIELD'
 *                 - $ref: '#/components/schemas/INVALID_INPUT_FORMAT'
 *             examples:
 *               MISSING_REQUEST_FIELD:
 *                 $ref: '#/components/examples/MISSING_REQUEST_FIELD_EXAMPLE'
 *               EMPTY_FIELD:
 *                 $ref: '#/components/examples/EMPTY_FIELD_EXAMPLE'
 *               INVALID_INPUT_FORMAT:
 *                 $ref: '#/components/examples/INVALID_INPUT_FORMAT_EXAMPLE'
 *       500:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DATABASE_ERROR'
 */
userRouter.put("/settings", auth, updateSettings);

//# Swagger описание запроса uploadBackgroundImage
/**
 * @swagger
 * /user/background-image:
 *   post:
 *     summary: Отправление фото для установки задний фон
 *     description: По данному запросу можно отправить фото, которое будет установленно на задний фон таймера
 *     tags: [User]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/uploadBackgroundImageRequest'
 *     responses:
 *       200:
 *         description: Задний фон успешно установлен
 *       400:
 *         description: Файл не был отправлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MISSING_FILE'
 *       500:
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/DATABASE_ERROR'
 *                 - $ref: '#/components/schemas/S3_STORAGE_ERROR'
 *             examples:
 *               DATABASE_ERROR:
 *                 $ref: "#/components/examples/DATABASE_ERROR_EXAMPLE"
 *               UNKNOWN_ERROR:
 *                 $ref: "#/components/examples/S3_STORAGE_ERROR_EXAMPLE"
 */
userRouter.post(
  "/background-image",
  getFilesMiddleware(1),
  auth,
  uploadBackgroundImage
);

//# Swagger описание запроса deleteBackgroundImage
/**
 * @swagger
 * /user/background-image:
 *   delete:
 *     summary: Удаление заднего фона
 *     description: По данному запросу можно удалить задний фон таймера
 *     tags: [User]
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Задний фон успешно удален
 *       404:
 *         description: Необходимые данные не найдены в базе данных
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DATA_NOT_FOUND'
 *       500:
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/DATABASE_ERROR'
 *                 - $ref: '#/components/schemas/S3_STORAGE_ERROR'
 *             examples:
 *               DATABASE_ERROR:
 *                 $ref: "#/components/examples/DATABASE_ERROR_EXAMPLE"
 *               UNKNOWN_ERROR:
 *                 $ref: "#/components/examples/S3_STORAGE_ERROR_EXAMPLE"
 */
userRouter.delete("/background-image", auth, deleteBackgroundImage);

userRouter.put("/user-type", auth, setUserType);

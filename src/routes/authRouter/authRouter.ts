//# --- LIBS ---
import { NextFunction, Request, Response, Router } from "express";
import * as dotenv from "dotenv";
import { rateLimit, RateLimitExceededEventHandler } from "express-rate-limit";

//# --- AUTH ---
import { auth } from "../../auth/authMiddleware";
import { refreshAuth } from "../../auth/refreshAuthMiddleware";

//# --- ROUTES ---
import { signUpRoute } from "./signUpRoute/signUpRoute";
import { signInRoute } from "./signInRoute/signInRoute";
import { logOutRoute } from "./logOutRoute/logOutRoute";
import { refreshTokenRoute } from "./refreshTokenRoute/refreshTokenRoute";
import { deleteAccountRoute } from "./deleteAccountRoute/deleteAccountRoute";
import { verifyEmailRoute } from "./verifyEmailRoute/verifyEmailRoute";
import { resendVerificationOtp } from "./resendVerificationOtp.ts/resendVerificationOtp";

// # --- ERRORS ---
import { err, RATE_LIMIT_EXCEEDED } from "../utils/errors/GlobalErrors";

dotenv.config();

const rateLimitExceededHandler: RateLimitExceededEventHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return res.status(429).json(err(new RATE_LIMIT_EXCEEDED()));
};

const authLimiter = rateLimit({
  windowMs: 60 * 1000, // # One minite time
  limit: 20,
  handler: rateLimitExceededHandler,
  validate: {
    xForwardedForHeader: false,
  },
});

export const authRouter = Router();

authRouter.use(authLimiter);

//# Swagger описание авторизации для access токена
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     Bearer:
 *       type: apiKey
 *       name: JWT токен
 *       in: заголовок "Authorization"
 *       description: >-
 *         Enter the token with the `Bearer: ` prefix, e.g. "Bearer abcde12345".
 */
//# Swagger описание авторизации для refresh токена
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     Refresh:
 *       type: apiKey
 *       name: JWT refresh токен
 *       in: заголовок "Authorization"
 *       description: >-
 *         Enter the token WITHOUT the `Bearer: ` prefix, e.g. "abcde12345".
 */

//# Swagger описание тега Auth
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Ручки для авторизации и утентификации
 */

//# Swagger описание запроса signUpRoute
/**
 * @swagger
 * /auth/sign-up:
 *   post:
 *     summary: Регистрации нового пользователя
 *     description: Используется при регстрации нового пользователя в приложении
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/signUpRequest'
 *     responses:
 *       200:
 *         description: Новый пользователь успешно создан в базе данных, но не подтвержден
 *       400:
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
 *       409:
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/NICKNAME_IS_TAKEN'
 *                 - $ref: '#/components/schemas/ACCOUNT_ALREADY_EXISTS'
 *             examples:
 *               NICKNAME_IS_TAKEN:
 *                 $ref: '#/components/examples/NICKNAME_IS_TAKEN_EXAMPLE'
 *               ACCOUNT_ALREADY_EXISTS:
 *                 $ref: '#/components/examples/ACCOUNT_ALREADY_EXISTS_EXAMPLE'
 *       500:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DATABASE_ERROR'
 *
 */
authRouter.post("/sign-up", signUpRoute);

//# Swagger описание запроса signInRoute
/**
 * @swagger
 * /auth/sign-in:
 *   post:
 *     summary: Вход пользователя в аккаунт
 *     description: Используется при входе существующего пользователя в свой аккаунт
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/signInRequest'
 *     responses:
 *       200:
 *         description: Пользователь успешно зашел в свой аккаунт
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/signInResponse'
 *       400:
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
 *       401:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/INCORRECT_PASSWORD'
 *       403:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ACCOUNT_NOT_VERIFIED'
 *       404:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DATA_NOT_FOUND'
 *       500:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DATABASE_ERROR'
 *
 */
authRouter.post("/sign-in", signInRoute);

//# Swagger описание запроса sendOtpVerification
/**
 * @swagger
 * /auth/send-otp-verification:
 *   post:
 *     summary: Отправить код на почту
 *     description: Используется для отправки одноразового кода подтверждения на почту нового пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/sendOtpVerificationRequest'
 *     responses:
 *       200:
 *         description: Код успешно отправлен на почту
 *       400:
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/MISSING_REQUEST_FIELD'
 *                 - $ref: '#/components/schemas/EMPTY_FIELD'
 *                 - $ref: '#/components/schemas/INVALID_INPUT_FORMAT'
 *                 - $ref: '#/components/schemas/ACCOUNT_ALREADY_VERIFIED'
 *             examples:
 *               MISSING_REQUEST_FIELD:
 *                 $ref: '#/components/examples/MISSING_REQUEST_FIELD_EXAMPLE'
 *               EMPTY_FIELD:
 *                 $ref: '#/components/examples/EMPTY_FIELD_EXAMPLE'
 *               INVALID_INPUT_FORMAT:
 *                 $ref: '#/components/examples/INVALID_INPUT_FORMAT_EXAMPLE'
 *               ACCOUNT_ALREADY_VERIFIED:
 *                 $ref: '#/components/examples/ACCOUNT_ALREADY_VERIFIED_EXAMPLE'
 *       404:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DATA_NOT_FOUND'
 *       500:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DATABASE_ERROR'
 *       503:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OTP_SENDING_UNAVAILABLE'
 */
authRouter.post("/resend-verification-otp", resendVerificationOtp);

//# Swagger описание запроса verifyEmailRoute
/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Подтвердить почту
 *     description: Используется для подтверждения почты посредством отправленного кода
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/verifyEmailRequest'
 *     responses:
 *       200:
 *         description: Код успешно отправлен на почту
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/verifyEmailResponse'
 *       400:
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/MISSING_REQUEST_FIELD'
 *                 - $ref: '#/components/schemas/EMPTY_FIELD'
 *                 - $ref: '#/components/schemas/INVALID_INPUT_FORMAT'
 *                 - $ref: '#/components/schemas/ACCOUNT_ALREADY_VERIFIED'
 *                 - $ref: '#/components/schemas/OTP_EXPIRED'
 *                 - $ref: '#/components/schemas/NOT_VALID_OTP'
 *             examples:
 *               MISSING_REQUEST_FIELD:
 *                 $ref: '#/components/examples/MISSING_REQUEST_FIELD_EXAMPLE'
 *               EMPTY_FIELD:
 *                 $ref: '#/components/examples/EMPTY_FIELD_EXAMPLE'
 *               INVALID_INPUT_FORMAT:
 *                 $ref: '#/components/examples/INVALID_INPUT_FORMAT_EXAMPLE'
 *               ACCOUNT_ALREADY_VERIFIED:
 *                 $ref: '#/components/examples/ACCOUNT_ALREADY_VERIFIED_EXAMPLE'
 *               OTP_EXPIRED:
 *                 $ref: '#/components/examples/OTP_EXPIRED_EXAMPLE'
 *               NOT_VALID_OTP:
 *                 $ref: '#/components/examples/NOT_VALID_OTP_EXAMPLE'
 *       404:
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/DATA_NOT_FOUND'
 *                 - $ref: '#/components/schemas/OTP_NOT_FOUND'
 *             examples:
 *               DATA_NOT_FOUND:
 *                 $ref: '#/components/examples/DATA_NOT_FOUND_EXAMPLE'
 *               OTP_NOT_FOUND:
 *                 $ref: '#/components/examples/OTP_NOT_FOUND_EXAMPLE'
 *       500:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DATABASE_ERROR'
 */
authRouter.post("/verify-email", verifyEmailRoute);

//# Swagger описание запроса logOutRoute
/**
 * @swagger
 * /auth/log-out:
 *   post:
 *     summary: Выйти из аккаунта
 *     description: Используется пользователем для того, чтобы выйти из аккаунта
 *     tags: [Auth]
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Пользователь успешно вышел из аккаунта
 *       404:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DATA_NOT_FOUND'
 *       500:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DATABASE_ERROR'
 */
authRouter.post("/log-out", auth, logOutRoute);

//# Swagger описание запроса deleteAccountRoute
/**
 * @swagger
 * /auth/:
 *   delete:
 *     summary: Удалить аккаунт
 *     description: Используется пользователем для того, чтобы навсегда удалить данные своего аккаунта
 *     tags: [Auth]
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Аккаунт пользователя успешно удален
 *       500:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DATABASE_ERROR'
 */
authRouter.delete("/", auth, deleteAccountRoute);

//# Swagger описание запроса refreshTokenRoute
/**
 * @swagger
 * /auth/refresh-token:
 *   get:
 *     summary: Обновить токен
 *     description: Используется пользователем для того, чтобы обновить как access, так и refresh токены
 *     tags: [Auth]
 *     security:
 *       - Refresh: []
 *     responses:
 *       200:
 *         description: Аккаунт пользователя успешно удален
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/refreshTokenResponse'
 *       403:
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/REFRESH_TOKEN_REVOKED'
 *                 - $ref: '#/components/schemas/OUTDATED_REFRESH_TOKEN'
 *             examples:
 *               REFRESH_TOKEN_REVOKED:
 *                 $ref: '#/components/examples/REFRESH_TOKEN_REVOKED_EXAMPLE'
 *               OUTDATED_REFRESH_TOKEN:
 *                 $ref: '#/components/examples/OUTDATED_REFRESH_TOKEN_EXAMPLE'
 *       404:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DATA_NOT_FOUND'
 *       500:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DATABASE_ERROR'
 */
authRouter.get("/refresh-token", refreshAuth, refreshTokenRoute);

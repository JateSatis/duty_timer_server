"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const typeorm_1 = require("typeorm");
const Friend_1 = require("./Friend");
const Timer_1 = require("./Timer");
const Event_1 = require("./Event");
const Settings_1 = require("./Settings");
const Chat_1 = require("./Chat");
const Message_1 = require("./Message");
const Subscription_1 = require("./Subscription");
const Enums_1 = require("../utils/Enums");
const FriendshipRequest_1 = require("./FriendshipRequest");
const RefreshToken_1 = require("./RefreshToken");
const OTPVerification_1 = require("./OTPVerification");
let User = class User extends typeorm_1.BaseEntity {
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "bigint",
        transformer: {
            to: (value) => value,
            from: (value) => parseInt(value),
        },
    }),
    __metadata("design:type", Number)
], User.prototype, "verificationExpiresAt", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => RefreshToken_1.RefreshToken, (refreshToken) => refreshToken.user, {
        cascade: true,
    }),
    __metadata("design:type", RefreshToken_1.RefreshToken)
], User.prototype, "refreshToken", void 0);
__decorate([
    (0, typeorm_1.Column)("text"),
    __metadata("design:type", String)
], User.prototype, "login", void 0);
__decorate([
    (0, typeorm_1.Column)("text"),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)("text", {
        unique: true,
    }),
    __metadata("design:type", String)
], User.prototype, "nickname", void 0);
__decorate([
    (0, typeorm_1.Column)("text", {
        nullable: true,
    }),
    __metadata("design:type", Object)
], User.prototype, "avatarImageName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: Enums_1.UserType,
        default: Enums_1.UserType.SOLDIER,
    }),
    __metadata("design:type", String)
], User.prototype, "userType", void 0);
__decorate([
    (0, typeorm_1.Column)("text"),
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    (0, typeorm_1.Column)("text"),
    __metadata("design:type", String)
], User.prototype, "passwordSalt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        default: "false",
    }),
    __metadata("design:type", Boolean)
], User.prototype, "isOnline", void 0);
__decorate([
    (0, typeorm_1.Column)("bigint"),
    __metadata("design:type", Number)
], User.prototype, "lastSeenOnline", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => OTPVerification_1.OTPVerification, (otpVerification) => otpVerification.user, {
        cascade: true,
        onDelete: "SET NULL",
    }),
    (0, typeorm_1.JoinColumn)({
        name: "otpVerificationId",
    }),
    __metadata("design:type", Object)
], User.prototype, "otpVerification", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Timer_1.Timer, (timer) => timer.users),
    (0, typeorm_1.JoinColumn)({
        name: "timerId",
    }),
    __metadata("design:type", Timer_1.Timer)
], User.prototype, "timer", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Event_1.Event, (event) => event.user, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], User.prototype, "events", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => FriendshipRequest_1.FriendshipRequest, (friendshipRequest) => friendshipRequest.sender, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], User.prototype, "sentFriendshipRequests", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => FriendshipRequest_1.FriendshipRequest, (friendshipRequest) => friendshipRequest.reciever, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], User.prototype, "recievedFriendshipRequests", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Friend_1.Friend, (friend) => friend.user, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], User.prototype, "friends", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Settings_1.Settings, (settings) => settings.user, {
        cascade: true,
        nullable: false,
    }),
    (0, typeorm_1.JoinColumn)({
        name: "settingsId",
    }),
    __metadata("design:type", Settings_1.Settings)
], User.prototype, "settings", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => Chat_1.Chat, (chat) => chat.users, {
        cascade: true,
        onDelete: "CASCADE",
    }),
    (0, typeorm_1.JoinTable)({
        name: "usersChats",
        joinColumn: {
            name: "userId",
            referencedColumnName: "id",
        },
        inverseJoinColumn: {
            name: "chatId",
            referencedColumnName: "id",
        },
    }),
    __metadata("design:type", Array)
], User.prototype, "chats", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Message_1.Message, (message) => message.sender, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], User.prototype, "messages", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Subscription_1.Subscription, (subscription) => subscription.user, {
        cascade: true,
    }),
    (0, typeorm_1.JoinColumn)({
        name: "subscriptionId",
    }),
    __metadata("design:type", Subscription_1.Subscription)
], User.prototype, "subscription", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)("user")
], User);
//# sourceMappingURL=User.js.map
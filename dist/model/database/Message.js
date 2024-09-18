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
exports.Message = void 0;
const typeorm_1 = require("typeorm");
const Chat_1 = require("./Chat");
const User_1 = require("./User");
const Attachment_1 = require("./Attachment");
let Message = class Message extends typeorm_1.BaseEntity {
};
exports.Message = Message;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Message.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)("text"),
    __metadata("design:type", String)
], Message.prototype, "text", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "bigint",
        transformer: {
            to: (value) => value,
            from: (value) => parseInt(value),
        },
    }),
    __metadata("design:type", Number)
], Message.prototype, "creationTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        default: false,
    }),
    __metadata("design:type", Boolean)
], Message.prototype, "isEdited", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Attachment_1.Attachment, (attachment) => attachment.message),
    __metadata("design:type", Array)
], Message.prototype, "attachments", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Chat_1.Chat, (chat) => chat.messages, {
        onDelete: "CASCADE",
    }),
    (0, typeorm_1.JoinColumn)({
        name: "chatId",
    }),
    __metadata("design:type", Chat_1.Chat)
], Message.prototype, "chat", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, (user) => user.messages, {
        onDelete: "CASCADE",
    }),
    (0, typeorm_1.JoinColumn)({
        name: "userId",
    }),
    __metadata("design:type", User_1.User)
], Message.prototype, "sender", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
    }),
    __metadata("design:type", Boolean)
], Message.prototype, "isRead", void 0);
exports.Message = Message = __decorate([
    (0, typeorm_1.Entity)("message")
], Message);
//# sourceMappingURL=Message.js.map
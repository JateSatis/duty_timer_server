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
exports.Chat = void 0;
const typeorm_1 = require("typeorm");
const Message_1 = require("./Message");
const User_1 = require("./User");
let Chat = class Chat extends typeorm_1.BaseEntity {
};
exports.Chat = Chat;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Chat.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Message_1.Message, (message) => message.chat, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], Chat.prototype, "messages", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => User_1.User, (user) => user.chats, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", Array)
], Chat.prototype, "users", void 0);
__decorate([
    (0, typeorm_1.Column)("text"),
    __metadata("design:type", String)
], Chat.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)("text", {
        nullable: true,
    }),
    __metadata("design:type", Object)
], Chat.prototype, "imageName", void 0);
__decorate([
    (0, typeorm_1.Column)("boolean", {
        nullable: false,
    }),
    __metadata("design:type", Boolean)
], Chat.prototype, "isGroup", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "bigint",
        transformer: {
            to: (value) => value,
            from: (value) => parseInt(value),
        },
        nullable: false,
    }),
    __metadata("design:type", Number)
], Chat.prototype, "creationTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "bigint",
        transformer: {
            to: (value) => value,
            from: (value) => parseInt(value),
        },
        nullable: false,
    }),
    __metadata("design:type", Number)
], Chat.prototype, "lastUpdateTimeMillis", void 0);
exports.Chat = Chat = __decorate([
    (0, typeorm_1.Entity)("chat")
], Chat);
//# sourceMappingURL=Chat.js.map
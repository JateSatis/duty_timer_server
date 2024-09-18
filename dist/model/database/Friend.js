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
exports.Friend = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
let Friend = class Friend extends typeorm_1.BaseEntity {
};
exports.Friend = Friend;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Friend.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, (user) => user.friends, {
        onDelete: "CASCADE",
    }),
    (0, typeorm_1.JoinColumn)({
        name: "userId",
    }),
    __metadata("design:type", User_1.User)
], Friend.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        transformer: {
            to: (value) => value,
            from: (value) => parseInt(value),
        },
    }),
    __metadata("design:type", Number)
], Friend.prototype, "friendId", void 0);
exports.Friend = Friend = __decorate([
    (0, typeorm_1.Entity)("friend")
], Friend);
//# sourceMappingURL=Friend.js.map
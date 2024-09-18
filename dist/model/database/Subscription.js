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
exports.Subscription = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
let Subscription = class Subscription extends typeorm_1.BaseEntity {
};
exports.Subscription = Subscription;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Subscription.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        default: false,
    }),
    __metadata("design:type", Boolean)
], Subscription.prototype, "active", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "bigint",
    }),
    __metadata("design:type", Number)
], Subscription.prototype, "expirationDate", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => User_1.User, (user) => user.subscription, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", User_1.User)
], Subscription.prototype, "user", void 0);
exports.Subscription = Subscription = __decorate([
    (0, typeorm_1.Entity)("subscription")
], Subscription);
//# sourceMappingURL=Subscription.js.map
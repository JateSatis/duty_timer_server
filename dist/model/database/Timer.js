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
exports.Timer = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
let Timer = class Timer extends typeorm_1.BaseEntity {
};
exports.Timer = Timer;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Timer.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "bigint",
        transformer: {
            to: (value) => value,
            from: (value) => parseInt(value),
        },
    }),
    __metadata("design:type", Number)
], Timer.prototype, "startTimeMillis", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "bigint",
        transformer: {
            to: (value) => value,
            from: (value) => parseInt(value),
        },
    }),
    __metadata("design:type", Number)
], Timer.prototype, "endTimeMillis", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => User_1.User, (user) => user.timer, {
        cascade: true,
    }),
    (0, typeorm_1.JoinColumn)({
        name: "userId",
    }),
    __metadata("design:type", Array)
], Timer.prototype, "users", void 0);
exports.Timer = Timer = __decorate([
    (0, typeorm_1.Entity)("timer")
], Timer);
//# sourceMappingURL=Timer.js.map
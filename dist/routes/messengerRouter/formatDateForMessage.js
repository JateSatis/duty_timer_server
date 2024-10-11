"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDateForMessage = void 0;
const formatDateForMessage = (milliseconds) => {
    const date = new Date(milliseconds);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const timeFormat = `${hours}:${minutes}`;
    const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
    };
    const dateFormat = date.toLocaleDateString("ru-RU", options);
    return { timeFormat, dateFormat };
};
exports.formatDateForMessage = formatDateForMessage;
//# sourceMappingURL=formatDateForMessage.js.map
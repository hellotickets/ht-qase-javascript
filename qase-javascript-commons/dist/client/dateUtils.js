"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStartTime = exports.formatUTCDate = void 0;
// Utils
const pad = (num) => num.toString().padStart(2, '0');
function formatUTCDate(date) {
    const year = date.getUTCFullYear();
    const month = pad(date.getUTCMonth() + 1);
    const day = pad(date.getUTCDate());
    const hours = pad(date.getUTCHours());
    const minutes = pad(date.getUTCMinutes());
    const seconds = pad(date.getUTCSeconds());
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
exports.formatUTCDate = formatUTCDate;
function getStartTime() {
    const date = new Date();
    return formatUTCDate(new Date(date.getTime() - 10000));
}
exports.getStartTime = getStartTime;

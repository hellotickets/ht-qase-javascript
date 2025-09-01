"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.qase = exports.default = void 0;
var reporter_1 = require("./reporter");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return reporter_1.PlaywrightQaseReporter; } });
var playwright_1 = require("./playwright");
Object.defineProperty(exports, "qase", { enumerable: true, get: function () { return playwright_1.qase; } });

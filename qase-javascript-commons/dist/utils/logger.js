"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const is_axios_error_1 = require("./is-axios-error");
const qase_error_1 = require("./qase-error");
class Logger {
    debug;
    filePath;
    constructor(options) {
        this.debug = options.debug;
        const dir = options.dir ?? './logs';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        this.filePath = path.join(dir, 'log.txt');
    }
    log(message) {
        const logMessage = `[INFO] qase: ${message}`;
        console.log(logMessage);
        if (this.debug) {
            this.logToFile(logMessage);
        }
    }
    logError(message, error) {
        const logMessage = `[ERROR] qase: ${this.doLogError(message, error)}`;
        console.error(logMessage);
        if (this.debug) {
            this.logToFile(logMessage);
        }
    }
    logDebug(message) {
        if (this.debug) {
            const logMessage = `[DEBUG] qase: ${message}`;
            console.log(logMessage);
            this.logToFile(logMessage);
        }
    }
    logToFile(message) {
        const formattedMessage = `[${new Date().toISOString()}] ${message}\n`;
        fs.appendFileSync(this.filePath, formattedMessage);
    }
    doLogError(message, error) {
        let logMessage = message;
        if (error instanceof Error) {
            if ((0, is_axios_error_1.isAxiosError)(error)) {
                logMessage += this.logApiError(error);
            }
            else if (error instanceof qase_error_1.QaseError && error.cause) {
                logMessage += this.doLogError('\n Caused by:', error.cause);
            }
            logMessage += `\n ${error.stack ?? `${error.name}: ${error.message}`}`;
        }
        else {
            logMessage += `\n ${String(error)}`;
        }
        return logMessage;
    }
    /**
     * @param {AxiosError} error
     * @private
     */
    logApiError(error) {
        if (!error.response?.data) {
            return `\nMessage: ${error.message || 'Unknown error'}`;
        }
        const response = error.response.data;
        const statusText = error.response.statusText;
        const errorMessage = response.errorMessage
            ?? response.error
            ?? statusText;
        const errorFields = this.formatErrorFields(response.errorFields);
        let logMessage = `\nMessage: ${errorMessage}`;
        if (errorFields) {
            logMessage += `\n${errorFields}`;
        }
        return logMessage;
    }
    /**
     * @param errorFields
     * @returns {string | undefined}
     * @private
     */
    formatErrorFields(errorFields) {
        if (!errorFields?.length) {
            return undefined;
        }
        return errorFields
            .map(({ field, error }) => `${field}: ${error}`)
            .join('\n');
    }
}
exports.Logger = Logger;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateJson = exports.JsonValidationError = void 0;
const ajv_1 = __importDefault(require("ajv"));
/**
 * @type {Ajv}
 */
const validator = new ajv_1.default({
    allowUnionTypes: true,
});
/**
 * @class JsonValidationError
 * @extends Error
 */
class JsonValidationError extends Error {
    validationErrors;
    /**
     * @param {ErrorObject[]} validationErrors
     * @param {string} message
     */
    constructor(validationErrors, message) {
        super(message);
        this.validationErrors = validationErrors;
    }
}
exports.JsonValidationError = JsonValidationError;
/**
 * @template T
 * @param {JSONSchemaType<T>} schema
 * @param json
 * @returns {asserts json is T}
 */
function validateJson(schema, json) {
    if (!validator.validate(schema, json)) {
        throw new JsonValidationError(validator.errors ? [...validator.errors] : []);
    }
}
exports.validateJson = validateJson;

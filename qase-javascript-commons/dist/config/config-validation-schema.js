"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configValidationSchema = void 0;
const options_1 = require("../options");
const writer_1 = require("../writer");
const TestOpsOptionsType_1 = require("../models/config/TestOpsOptionsType");
/**
 * @type {JSONSchemaType<ConfigType>}
 */
exports.configValidationSchema = {
    type: 'object',
    properties: {
        mode: {
            type: 'string',
            enum: [options_1.ModeEnum.report, options_1.ModeEnum.testops, options_1.ModeEnum.off],
            nullable: true,
        },
        fallback: {
            type: 'string',
            enum: [options_1.ModeEnum.report, options_1.ModeEnum.testops, options_1.ModeEnum.off],
            nullable: true,
        },
        debug: {
            type: 'boolean',
            nullable: true,
        },
        environment: {
            type: 'string',
            nullable: true,
        },
        captureLogs: {
            type: 'boolean',
            nullable: true,
        },
        rootSuite: {
            type: 'string',
            nullable: true,
        },
        testops: {
            type: 'object',
            nullable: true,
            properties: {
                api: {
                    type: 'object',
                    nullable: true,
                    properties: {
                        token: {
                            type: 'string',
                            nullable: true,
                        },
                        host: {
                            type: 'string',
                            nullable: true,
                        },
                    },
                },
                project: {
                    type: 'string',
                    nullable: true,
                },
                uploadAttachments: {
                    type: 'boolean',
                    nullable: true,
                },
                uploadTrace: {
                    type: 'boolean',
                    nullable: true,
                },
                run: {
                    type: 'object',
                    nullable: true,
                    properties: {
                        id: {
                            type: 'number',
                            nullable: true,
                        },
                        title: {
                            type: 'string',
                            nullable: true,
                        },
                        description: {
                            type: 'string',
                            nullable: true,
                        },
                        complete: {
                            type: 'boolean',
                            nullable: true,
                        },
                        tags: {
                            type: 'array',
                            items: {
                                type: 'string',
                            },
                            nullable: true,
                        },
                        externalLink: {
                            type: 'object',
                            nullable: true,
                            properties: {
                                type: {
                                    type: 'string',
                                    enum: [TestOpsOptionsType_1.ExternalLinkType.JIRA_CLOUD, TestOpsOptionsType_1.ExternalLinkType.JIRA_SERVER],
                                },
                                link: {
                                    type: 'string',
                                },
                            },
                            required: ['type', 'link'],
                        },
                    },
                },
                plan: {
                    type: 'object',
                    nullable: true,
                    properties: {
                        id: {
                            type: 'number',
                            nullable: true,
                        },
                    },
                },
                batch: {
                    type: 'object',
                    nullable: true,
                    properties: {
                        size: {
                            type: 'number',
                            nullable: true,
                        },
                    },
                },
                defect: {
                    type: 'boolean',
                    nullable: true,
                },
                configurations: {
                    type: 'object',
                    nullable: true,
                    properties: {
                        values: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    name: {
                                        type: 'string',
                                        nullable: true,
                                    },
                                    value: {
                                        type: 'string',
                                        nullable: true,
                                    },
                                },
                                required: ['name', 'value'],
                            },
                        },
                        createIfNotExists: {
                            type: 'boolean',
                            nullable: true,
                        },
                    },
                    required: ['values'],
                },
            },
        },
        report: {
            type: 'object',
            nullable: true,
            properties: {
                driver: {
                    type: 'string',
                    enum: [writer_1.DriverEnum.local],
                    nullable: true,
                },
                connections: {
                    type: 'object',
                    nullable: true,
                    properties: {
                        [writer_1.DriverEnum.local]: {
                            type: 'object',
                            nullable: true,
                            properties: {
                                path: {
                                    type: 'string',
                                    nullable: true,
                                },
                                format: {
                                    type: 'string',
                                    enum: [writer_1.FormatEnum.json, writer_1.FormatEnum.jsonp],
                                    nullable: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    },
};

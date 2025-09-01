import { ModeEnum } from '../options';
import { DriverEnum, FormatEnum } from '../writer';
import { ExternalLinkType } from '../models/config/TestOpsOptionsType';
/**
 * @type {JSONSchemaType<ConfigType>}
 */
export declare const configValidationSchema: {
    type: string;
    properties: {
        mode: {
            type: string;
            enum: ModeEnum[];
            nullable: boolean;
        };
        fallback: {
            type: string;
            enum: ModeEnum[];
            nullable: boolean;
        };
        debug: {
            type: string;
            nullable: boolean;
        };
        environment: {
            type: string;
            nullable: boolean;
        };
        captureLogs: {
            type: string;
            nullable: boolean;
        };
        rootSuite: {
            type: string;
            nullable: boolean;
        };
        testops: {
            type: string;
            nullable: boolean;
            properties: {
                api: {
                    type: string;
                    nullable: boolean;
                    properties: {
                        token: {
                            type: string;
                            nullable: boolean;
                        };
                        host: {
                            type: string;
                            nullable: boolean;
                        };
                    };
                };
                project: {
                    type: string;
                    nullable: boolean;
                };
                uploadAttachments: {
                    type: string;
                    nullable: boolean;
                };
                uploadTrace: {
                    type: string;
                    nullable: boolean;
                };
                run: {
                    type: string;
                    nullable: boolean;
                    properties: {
                        id: {
                            type: string;
                            nullable: boolean;
                        };
                        title: {
                            type: string;
                            nullable: boolean;
                        };
                        description: {
                            type: string;
                            nullable: boolean;
                        };
                        complete: {
                            type: string;
                            nullable: boolean;
                        };
                        tags: {
                            type: string;
                            items: {
                                type: string;
                            };
                            nullable: boolean;
                        };
                        externalLink: {
                            type: string;
                            nullable: boolean;
                            properties: {
                                type: {
                                    type: string;
                                    enum: ExternalLinkType[];
                                };
                                link: {
                                    type: string;
                                };
                            };
                            required: string[];
                        };
                    };
                };
                plan: {
                    type: string;
                    nullable: boolean;
                    properties: {
                        id: {
                            type: string;
                            nullable: boolean;
                        };
                    };
                };
                batch: {
                    type: string;
                    nullable: boolean;
                    properties: {
                        size: {
                            type: string;
                            nullable: boolean;
                        };
                    };
                };
                defect: {
                    type: string;
                    nullable: boolean;
                };
                configurations: {
                    type: string;
                    nullable: boolean;
                    properties: {
                        values: {
                            type: string;
                            items: {
                                type: string;
                                properties: {
                                    name: {
                                        type: string;
                                        nullable: boolean;
                                    };
                                    value: {
                                        type: string;
                                        nullable: boolean;
                                    };
                                };
                                required: string[];
                            };
                        };
                        createIfNotExists: {
                            type: string;
                            nullable: boolean;
                        };
                    };
                    required: string[];
                };
            };
        };
        report: {
            type: string;
            nullable: boolean;
            properties: {
                driver: {
                    type: string;
                    enum: DriverEnum[];
                    nullable: boolean;
                };
                connections: {
                    type: string;
                    nullable: boolean;
                    properties: {
                        local: {
                            type: string;
                            nullable: boolean;
                            properties: {
                                path: {
                                    type: string;
                                    nullable: boolean;
                                };
                                format: {
                                    type: string;
                                    enum: FormatEnum[];
                                    nullable: boolean;
                                };
                            };
                        };
                    };
                };
            };
        };
    };
};

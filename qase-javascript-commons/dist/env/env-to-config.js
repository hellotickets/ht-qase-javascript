"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envToConfig = void 0;
const env_enum_1 = require("./env-enum");
const writer_1 = require("../writer");
/**
 * @param {EnvType} env
 * @returns {ConfigType}
 */
const envToConfig = (env) => ({
    mode: env[env_enum_1.EnvEnum.mode],
    debug: env[env_enum_1.EnvEnum.debug],
    environment: env[env_enum_1.EnvEnum.environment],
    captureLogs: env[env_enum_1.EnvEnum.captureLogs],
    rootSuite: env[env_enum_1.EnvEnum.rootSuite],
    testops: {
        project: env[env_enum_1.EnvTestOpsEnum.project],
        uploadAttachments: env[env_enum_1.EnvTestOpsEnum.uploadAttachments],
        uploadTrace: env[env_enum_1.EnvTestOpsEnum.uploadTrace],
        api: {
            token: env[env_enum_1.EnvApiEnum.token],
            host: env[env_enum_1.EnvApiEnum.host],
        },
        run: {
            id: env[env_enum_1.EnvRunEnum.id],
            title: env[env_enum_1.EnvRunEnum.title],
            description: env[env_enum_1.EnvRunEnum.description],
            complete: env[env_enum_1.EnvRunEnum.complete],
            tags: env[env_enum_1.EnvRunEnum.tags]?.split(',').map(tag => tag.trim()) ?? [],
            externalLink: env[env_enum_1.EnvRunEnum.externalLink] ? (() => {
                try {
                    const externalLinkValue = env[env_enum_1.EnvRunEnum.externalLink];
                    if (!externalLinkValue)
                        return undefined;
                    const parsed = JSON.parse(externalLinkValue);
                    // Validate that type is a valid ExternalLinkType value
                    if (parsed.type !== 'jiraCloud' && parsed.type !== 'jiraServer') {
                        return undefined;
                    }
                    return {
                        type: parsed.type,
                        link: parsed.link,
                    };
                }
                catch {
                    return undefined;
                }
            })() : undefined,
        },
        plan: {
            id: env[env_enum_1.EnvPlanEnum.id],
        },
        batch: {
            size: env[env_enum_1.EnvBatchEnum.size],
        },
        defect: env[env_enum_1.EnvTestOpsEnum.defect],
        configurations: env[env_enum_1.EnvConfigurationsEnum.values] ? {
            values: env[env_enum_1.EnvConfigurationsEnum.values].split(',').map(item => {
                const [name, value] = item.split('=');
                return { name: (name ?? '').trim(), value: value ? value.trim() : '' };
            }),
            createIfNotExists: env[env_enum_1.EnvConfigurationsEnum.createIfNotExists],
        } : undefined,
    },
    report: {
        connections: {
            [writer_1.DriverEnum.local]: {
                path: env[env_enum_1.EnvLocalEnum.path],
                format: env[env_enum_1.EnvLocalEnum.format],
            },
        },
    },
});
exports.envToConfig = envToConfig;

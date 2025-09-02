"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientV1 = void 0;
const qase_api_client_1 = require("qase-api-client");
const is_axios_error_1 = require("../utils/is-axios-error");
const qase_error_1 = require("../utils/qase-error");
const chalk_1 = __importDefault(require("chalk"));
const fs_1 = require("fs");
const dateUtils_1 = require("./dateUtils");
const form_data_1 = __importDefault(require("form-data"));
const DEFAULT_API_HOST = 'qase.io';
const API_BASE_URL = 'https://api-';
const APP_BASE_URL = 'https://app-';
const API_VERSION = '/v1';
var ApiErrorCode;
(function (ApiErrorCode) {
    ApiErrorCode[ApiErrorCode["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    ApiErrorCode[ApiErrorCode["FORBIDDEN"] = 403] = "FORBIDDEN";
    ApiErrorCode[ApiErrorCode["NOT_FOUND"] = 404] = "NOT_FOUND";
    ApiErrorCode[ApiErrorCode["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    ApiErrorCode[ApiErrorCode["UNPROCESSABLE_ENTITY"] = 422] = "UNPROCESSABLE_ENTITY";
})(ApiErrorCode || (ApiErrorCode = {}));
class ClientV1 {
    logger;
    config;
    environment;
    appUrl;
    runClient;
    environmentClient;
    attachmentClient;
    configurationClient;
    constructor(logger, config, environment) {
        this.logger = logger;
        this.config = config;
        this.environment = environment;
        const { apiConfig, appUrl } = this.createApiConfig();
        this.appUrl = appUrl;
        this.runClient = new qase_api_client_1.RunsApi(apiConfig);
        this.environmentClient = new qase_api_client_1.EnvironmentsApi(apiConfig);
        this.attachmentClient = new qase_api_client_1.AttachmentsApi(apiConfig);
        this.configurationClient = new qase_api_client_1.ConfigurationsApi(apiConfig);
    }
    createApiConfig() {
        const apiConfig = new qase_api_client_1.Configuration({ apiKey: this.config.api.token, formDataCtor: form_data_1.default });
        if (this.config.api.host && this.config.api.host != DEFAULT_API_HOST) {
            apiConfig.basePath = `${API_BASE_URL}${this.config.api.host}${API_VERSION}`;
            return { apiConfig, appUrl: `${APP_BASE_URL}${this.config.api.host}` };
        }
        apiConfig.basePath = `https://api.${DEFAULT_API_HOST}${API_VERSION}`;
        return { apiConfig, appUrl: `https://app.${DEFAULT_API_HOST}` };
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    uploadResults(_runId, _results) {
        throw new Error('Use ClientV2 to upload results');
    }
    async createRun() {
        if (this.config.run.id) {
            return this.config.run.id;
        }
        try {
            // Handle configurations if provided
            let configurationIds = [];
            if (this.config.configurations) {
                configurationIds = await this.handleConfigurations();
            }
            const environmentId = await this.getEnvironmentId();
            const runObject = this.prepareRunObject(environmentId, configurationIds);
            this.logger.logDebug(`Creating test run: ${JSON.stringify(runObject)}`);
            const { data } = await this.runClient.createRun(this.config.project, runObject);
            if (!data.result?.id) {
                throw new qase_error_1.QaseError('Failed to create test run');
            }
            this.logger.logDebug(`Test run created: ${JSON.stringify(data)}`);
            if (this.config.run.externalLink && data.result.id) {
                // Map our enum values to API enum values
                // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
                const apiType = this.config.run.externalLink.type === 'jiraCloud'
                    ? qase_api_client_1.RunexternalIssuesTypeEnum.CLOUD
                    : qase_api_client_1.RunexternalIssuesTypeEnum.SERVER;
                await this.runClient.runUpdateExternalIssue(this.config.project, {
                    type: apiType,
                    links: [
                        {
                            run_id: data.result.id,
                            external_issue: this.config.run.externalLink.link,
                        },
                    ],
                });
            }
            return data.result.id;
        }
        catch (error) {
            throw this.processError(error, 'Error creating test run');
        }
    }
    async completeRun(runId) {
        if (!this.config.run.complete) {
            return;
        }
        try {
            await this.runClient.completeRun(this.config.project, runId);
        }
        catch (error) {
            throw this.processError(error, 'Error on completing run');
        }
        if (this.appUrl) {
            const runUrl = `${this.appUrl}/run/${this.config.project}/dashboard/${runId}`;
            this.logger.log((0, chalk_1.default) `{blue Test run link: ${runUrl}}`);
        }
    }
    async uploadAttachment(attachment) {
        try {
            const data = this.prepareAttachmentData(attachment);
            const response = await this.attachmentClient.uploadAttachment(this.config.project, [data]);
            return response.data.result?.[0]?.hash ?? '';
        }
        catch (error) {
            throw this.processError(error, 'Error on uploading attachment');
        }
    }
    async uploadAttachments(attachments) {
        if (!this.config.uploadAttachments) {
            return [];
        }
        const uploadedHashes = [];
        for (const attachment of attachments) {
            if (attachment.file_path?.endsWith('trace.zip') && attachment.mime_type === 'application/zip' && this.config.uploadTrace === false) {
                continue;
            }
            try {
                this.logger.logDebug(`Uploading attachment: ${attachment.file_path ?? attachment.file_name}`);
                const data = this.prepareAttachmentData(attachment);
                const response = await this.attachmentClient.uploadAttachment(this.config.project, [data]);
                const hash = response.data.result?.[0]?.hash;
                if (hash) {
                    uploadedHashes.push(hash);
                }
            }
            catch (error) {
                this.logger.logError('Cannot upload attachment:', error);
            }
        }
        return uploadedHashes;
    }
    prepareAttachmentData(attachment) {
        if (attachment.file_path) {
            return {
                name: attachment.file_name,
                value: (0, fs_1.createReadStream)(attachment.file_path),
            };
        }
        return {
            name: attachment.file_name,
            value: typeof attachment.content === 'string'
                ? Buffer.from(attachment.content, attachment.content.match(/^[A-Za-z0-9+/=]+$/) ? 'base64' : undefined)
                : attachment.content,
        };
    }
    async getEnvironmentId() {
        if (!this.environment)
            return undefined;
        const { data } = await this.environmentClient.getEnvironments(this.config.project, undefined, this.environment, 100);
        return data.result?.entities?.find((env) => env.slug === this.environment)?.id;
    }
    prepareRunObject(environmentId, configurationIds) {
        const runObject = {
            title: this.config.run.title ?? `Automated run ${new Date().toISOString()}`,
            description: this.config.run.description ?? '',
            is_autotest: true,
            cases: [],
            start_time: (0, dateUtils_1.getStartTime)(),
            tags: this.config.run.tags ?? [],
        };
        if (environmentId !== undefined) {
            runObject.environment_id = environmentId;
        }
        if (this.config.plan.id) {
            runObject.plan_id = this.config.plan.id;
        }
        if (configurationIds && configurationIds.length > 0) {
            runObject.configurations = configurationIds;
        }
        return runObject;
    }
    /**
     * Get all configuration groups with their configurations
     * @returns Promise<ConfigurationGroup[]> Array of configuration groups
     * @private
     */
    async getConfigurations() {
        try {
            const { data } = await this.configurationClient.getConfigurations(this.config.project);
            const entities = data.result?.entities ?? [];
            // Convert API response to domain model
            return entities.map(group => ({
                id: group.id ?? 0,
                title: group.title ?? '',
                configurations: group.configurations?.map(config => ({
                    id: config.id ?? 0,
                    title: config.title ?? ''
                })) ?? []
            }));
        }
        catch (error) {
            throw this.processError(error, 'Error getting configurations');
        }
    }
    /**
     * Create a configuration group
     * @param title Group title
     * @returns Promise<number | undefined> Created group ID
     * @private
     */
    async createConfigurationGroup(title) {
        try {
            const group = { title };
            const { data } = await this.configurationClient.createConfigurationGroup(this.config.project, group);
            return data.result?.id;
        }
        catch (error) {
            throw this.processError(error, 'Error creating configuration group');
        }
    }
    /**
     * Create a configuration in a group
     * @param title Configuration title
     * @param groupId Group ID
     * @returns Promise<number | undefined> Created configuration ID
     * @private
     */
    async createConfiguration(title, groupId) {
        try {
            const config = { title, group_id: groupId };
            const { data } = await this.configurationClient.createConfiguration(this.config.project, config);
            return data.result?.id;
        }
        catch (error) {
            throw this.processError(error, 'Error creating configuration');
        }
    }
    /**
     * Handle configuration creation based on config settings
     * @returns Promise<number[]> Array of configuration IDs
     * @private
     */
    async handleConfigurations() {
        if (!this.config.configurations?.values.length) {
            return [];
        }
        const configurationIds = [];
        try {
            // Get existing configuration groups
            const existingGroups = await this.getConfigurations();
            for (const configValue of this.config.configurations.values) {
                const { name: groupName, value: configName } = configValue;
                // Find existing group or create new one
                const group = existingGroups.find(g => g.title === groupName);
                let groupId;
                if (group) {
                    groupId = group.id;
                    this.logger.logDebug(`Found existing configuration group: ${groupName}`);
                }
                else {
                    if (this.config.configurations.createIfNotExists) {
                        const newGroupId = await this.createConfigurationGroup(groupName);
                        if (newGroupId) {
                            groupId = newGroupId;
                            this.logger.logDebug(`Created new configuration group: ${groupName} with ID: ${groupId}`);
                        }
                        else {
                            this.logger.logDebug(`Failed to create configuration group: ${groupName}, skipping`);
                            continue;
                        }
                    }
                    else {
                        this.logger.logDebug(`Configuration group not found: ${groupName}, skipping`);
                        continue;
                    }
                }
                if (groupId) {
                    // Check if configuration already exists in the group
                    const existingConfig = group?.configurations.find(c => c.title === configName);
                    if (!existingConfig) {
                        // Check if we should create configuration if it doesn't exist
                        if (this.config.configurations.createIfNotExists) {
                            const configId = await this.createConfiguration(configName, groupId);
                            if (configId) {
                                configurationIds.push(configId);
                            }
                            this.logger.logDebug(`Created configuration: ${configName} in group: ${groupName}`);
                        }
                        else {
                            this.logger.logDebug(`Configuration not found: ${configName} in group: ${groupName}, skipping`);
                        }
                    }
                    else {
                        if (existingConfig.id) {
                            configurationIds.push(existingConfig.id);
                        }
                        this.logger.logDebug(`Configuration already exists: ${configName} in group: ${groupName}`);
                    }
                }
            }
        }
        catch (error) {
            this.logger.logError('Error handling configurations:', error);
            // Don't throw error to avoid blocking test run creation
        }
        return configurationIds;
    }
    /**
     * Process error and throw QaseError
     * @param {Error | AxiosError} error
     * @param {string} message
     * @param {object} model
     * @private
     */
    processError(error, message, model) {
        if (!(0, is_axios_error_1.isAxiosError)(error)) {
            return new qase_error_1.QaseError(message, { cause: error });
        }
        const err = error;
        const errorData = err.response?.data;
        const status = err.response?.status;
        switch (status) {
            case ApiErrorCode.UNAUTHORIZED:
                return new qase_error_1.QaseError(`${message}: Unauthorized. Please check your API token.`);
            case ApiErrorCode.FORBIDDEN:
                return new qase_error_1.QaseError(`${message}: ${errorData?.errorMessage ?? 'Forbidden'}`);
            case ApiErrorCode.NOT_FOUND:
                return new qase_error_1.QaseError(`${message}: Not found.`);
            case ApiErrorCode.BAD_REQUEST:
            case ApiErrorCode.UNPROCESSABLE_ENTITY:
                return new qase_error_1.QaseError(`${message}: Bad request\n${JSON.stringify(errorData)}\nBody: ${JSON.stringify(model)}`);
            default:
                return new qase_error_1.QaseError(message, { cause: err });
        }
    }
}
exports.ClientV1 = ClientV1;

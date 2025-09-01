import { Attachment, TestResultType } from '../models';
import { TestOpsOptionsType } from '../models/config/TestOpsOptionsType';
import { QaseError } from '../utils/qase-error';
import { IClient } from './interface';
import { LoggerInterface } from '../utils/logger';
export declare class ClientV1 implements IClient {
    protected readonly logger: LoggerInterface;
    protected readonly config: TestOpsOptionsType;
    private readonly environment;
    private readonly appUrl;
    private readonly runClient;
    private readonly environmentClient;
    private readonly attachmentClient;
    private readonly configurationClient;
    constructor(logger: LoggerInterface, config: TestOpsOptionsType, environment: string | undefined);
    private createApiConfig;
    uploadResults(_runId: number, _results: TestResultType[]): Promise<void>;
    createRun(): Promise<number>;
    completeRun(runId: number): Promise<void>;
    uploadAttachment(attachment: Attachment): Promise<string>;
    protected uploadAttachments(attachments: Attachment[]): Promise<string[]>;
    private prepareAttachmentData;
    private getEnvironmentId;
    private prepareRunObject;
    /**
     * Get all configuration groups with their configurations
     * @returns Promise<ConfigurationGroup[]> Array of configuration groups
     * @private
     */
    private getConfigurations;
    /**
     * Create a configuration group
     * @param title Group title
     * @returns Promise<number | undefined> Created group ID
     * @private
     */
    private createConfigurationGroup;
    /**
     * Create a configuration in a group
     * @param title Configuration title
     * @param groupId Group ID
     * @returns Promise<number | undefined> Created configuration ID
     * @private
     */
    private createConfiguration;
    /**
     * Handle configuration creation based on config settings
     * @returns Promise<number[]> Array of configuration IDs
     * @private
     */
    private handleConfigurations;
    /**
     * Process error and throw QaseError
     * @param {Error | AxiosError} error
     * @param {string} message
     * @param {object} model
     * @private
     */
    protected processError(error: unknown, message: string, model?: object): QaseError;
}

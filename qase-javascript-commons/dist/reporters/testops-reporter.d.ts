import { AbstractReporter } from './abstract-reporter';
import { Attachment, TestResultType } from '../models';
import { LoggerInterface } from '../utils/logger';
import { IClient } from '../client/interface';
/**
 * @class TestOpsReporter
 * @extends AbstractReporter
 */
export declare class TestOpsReporter extends AbstractReporter {
    private api;
    private withState;
    private projectCode;
    private readonly baseUrl;
    private readonly batchSize;
    private runId;
    private firstIndex;
    private isTestRunReady;
    private mutex;
    /**
     * @param {LoggerInterface} logger
     * @param {IClient} api
     * @param {boolean} withState
     * @param {string} projectCode
     * @param {string | undefined} baseUrl
     * @param {number | undefined} batchSize
     */
    constructor(logger: LoggerInterface, api: IClient, withState: boolean, projectCode: string, baseUrl?: string, batchSize?: number, runId?: number);
    /**
     * @returns {Promise<void>}
     */
    startTestRun(): Promise<void>;
    /**
     * @param {TestResultType} result
     * @returns {Promise<void>}
     */
    addTestResult(result: TestResultType): Promise<void>;
    /**
     * @returns {Promise<void>}
     */
    private checkOrCreateTestRun;
    /**
     * @returns {Promise<void>}
     * @param testResults
     * @private
     */
    private publishResults;
    /**
     * @returns {Promise<void>}
     */
    publish(): Promise<void>;
    /**
     * @returns {Promise<void>}
     */
    sendResults(): Promise<void>;
    /**
     * @param {Attachment} attachment
     * @returns {Promise<string>}
     */
    uploadAttachment(attachment: Attachment): Promise<string>;
    /**
     * @returns {Promise<void>}
     */
    complete(): Promise<void>;
    /**
     * @param {string | undefined} url
     * @return string
     * @private
     */
    private getBaseUrl;
    /**
     * @param {number | null} id
     * @param {string} title
     * @return string
     * @private
     */
    private prepareFailedTestLink;
    /**
     * Show link to failed test
     * @param {number | null} id
     * @param {string} title
     * @private
     */
    private showLink;
}

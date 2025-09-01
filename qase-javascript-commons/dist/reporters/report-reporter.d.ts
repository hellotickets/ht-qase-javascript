import { AbstractReporter } from './abstract-reporter';
import { Attachment } from '../models';
import { WriterInterface } from '../writer';
import { LoggerInterface } from '../utils/logger';
/**
 * @class ReportReporter
 * @extends AbstractReporter
 */
export declare class ReportReporter extends AbstractReporter {
    private writer;
    private frameworkName;
    private reporterName;
    private readonly environment;
    private readonly runId;
    private readonly rootSuite;
    private startTime;
    /**
     * @param {LoggerInterface} logger
     * @param {WriterInterface} writer
     * @param {string} frameworkName
     * @param {string} reporterName
     * @param {string | undefined} environment
     * @param {string | undefined} rootSuite
     * @param {number | undefined} runId
     */
    constructor(logger: LoggerInterface, writer: WriterInterface, frameworkName: string, reporterName: string, environment?: string, rootSuite?: string, runId?: number);
    /**
     * @returns {Promise<void>}
     */
    startTestRun(): Promise<void>;
    /**
     * @returns {Promise<void>}
     *
     */
    publish(): Promise<void>;
    sendResults(): Promise<void>;
    complete(): Promise<void>;
    uploadAttachment(attachment: Attachment): Promise<string>;
    /**
     * @param {TestStepType[]} steps
     * @returns {TestStepType[]}
     */
    private copyStepAttachments;
}

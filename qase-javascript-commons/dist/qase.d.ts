import { OptionsType } from './options';
import { TestResultType, Attachment } from './models';
export interface ReporterInterface {
    addTestResult(result: TestResultType): Promise<void>;
    publish(): Promise<void>;
    startTestRun(): void;
    startTestRunAsync(): Promise<void>;
    isCaptureLogs(): boolean;
    getResults(): TestResultType[];
    sendResults(): Promise<void>;
    complete(): Promise<void>;
    uploadAttachment(attachment: Attachment): Promise<string>;
}
/**
 * @class QaseReporter
 * @implements AbstractReporter
 */
export declare class QaseReporter implements ReporterInterface {
    private static instance;
    /**
     * @type {InternalReporterInterface}
     * @private
     */
    private readonly upstreamReporter?;
    /**
     * @type {InternalReporterInterface}
     * @private
     */
    private readonly fallbackReporter?;
    /**
     * @type {boolean | undefined}
     * @private
     */
    private readonly captureLogs;
    /**
     * @type {boolean}
     * @private
     */
    private disabled;
    /**
     * @type {boolean}
     * @private
     */
    private useFallback;
    private readonly logger;
    private startTestRunOperation?;
    private options;
    private withState;
    /**
     * @param {OptionsType} options
     */
    private constructor();
    uploadAttachment(attachment: Attachment): Promise<string>;
    getResults(): TestResultType[];
    setTestResults(results: TestResultType[]): void;
    sendResults(): Promise<void>;
    complete(): Promise<void>;
    /**
     * @returns {void}
     */
    startTestRun(): void;
    startTestRunAsync(): Promise<void>;
    /**
     * @param {OptionsType} options
     * @returns {QaseReporter}
     */
    static getInstance(options: OptionsType): QaseReporter;
    /**
     * @param {TestResultType} result
     */
    addTestResult(result: TestResultType): Promise<void>;
    /**
     * @param {TestResultType} result
     * @private
     */
    private addTestResultToFallback;
    /**
     * @returns {boolean}
     */
    isCaptureLogs(): boolean;
    /**
     * @returns {Promise<void>}
     */
    publish(): Promise<void>;
    /**
     * @returns {Promise<void>}
     */
    private publishFallback;
    /**
     * @todo implement mode registry
     * @param {ModeEnum} mode
     * @param {OptionsType} options
     * @returns {InternalReporterInterface}
     * @private
     */
    private createReporter;
    /**
     * @param {TestResultType} test
     * @private
     */
    private logTestItem;
    private setWithState;
    private maskToken;
    private sanitizeOptions;
}

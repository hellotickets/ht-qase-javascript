import { Reporter, TestCase, TestResult, TestStatus, TestStep } from '@playwright/test/reporter';
import { ConfigLoader, ConfigType, TestStatusEnum } from 'qase-javascript-commons';
import { ReporterOptionsType } from './options';
export type PlaywrightQaseOptionsType = Omit<ConfigType, 'reporterOptions'> & {
    framework: ReporterOptionsType;
};
/**
 * @class PlaywrightQaseReporter
 * @implements Reporter
 */
export declare class PlaywrightQaseReporter implements Reporter {
    /**
     * @type {Record<TestStatus, TestStatusEnum>}
     */
    static statusMap: Record<TestStatus, TestStatusEnum>;
    /**
     * @type {Map<string, number[]>}
     * @private
     */
    private static qaseIds;
    /**
     * @param {TestCase} test
     * @returns {string[]}
     * @private
     */
    private static transformSuiteTitle;
    /**
     * @type {Map<TestStep, TestCase>}
     * @private
     */
    private stepCache;
    /**
     * @type {Map<string, TestStep>}
     * @private
     */
    private stepAttachments;
    /**
     * @param {ArrayItemType<TestResult['attachments']>[]} testAttachments
     * @returns {TestCaseMetadata}
     * @private
     */
    private transformAttachments;
    /**
     * @param {TestError[]} testErrors
     * @returns {Error}
     * @private
     */
    private static transformError;
    /**
     * @param {TestStep[]} testSteps
     * @param parentId
     * @returns {TestStepType[]}
     * @private
     */
    private transformSteps;
    /**
     * @type {ReporterInterface}
     * @private
     */
    private reporter;
    private options;
    /**
     * @param {PlaywrightQaseOptionsType} options
     * @param {ConfigLoaderInterface} configLoader
     */
    constructor(options: PlaywrightQaseOptionsType, configLoader?: ConfigLoader<Partial<ConfigType> & Record<string, unknown>>);
    /**
     * @param {TestCase} test
     * @param _result
     * @param step
     */
    onStepBegin(test: TestCase, _result: TestResult, step: TestStep): void;
    onBegin(): void;
    /**
     * @param {TestCase} test
     * @param {TestResult} result
     */
    onTestEnd(test: TestCase, result: TestResult): Promise<void>;
    /**
     * @returns {Promise<void>}
     */
    onEnd(): Promise<void>;
    static addIds(ids: number[], title: string): void;
    /**
     * @param {(string | Buffer)[]} logs
     * @param {string} name
     * @returns {Attachment}
     * @private
     */
    private convertLogsToAttachments;
    /**
     * @param {string} title
     * @returns {string}
     * @private
     */
    private removeQaseIdsFromTitle;
    /**
     * @param annotation
     * @returns {number[]}
     * @private
     */
    private extractQaseIdsFromAnnotation;
    /**
     * @param annotation
     * @returns {string[]}
     * @private
     */
    private extractSuiteFromAnnotation;
    /**
     * @param {TestStep[]} steps
     * @returns {boolean}
     * @private
     */
    private checkChildrenSteps;
    private extractAndCleanStep;
}

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaywrightQaseReporter = void 0;
const uuid_1 = require("uuid");
const path = __importStar(require("path"));
const qase_javascript_commons_1 = require("qase-javascript-commons");
const playwright_1 = require("./playwright");
const stepAttachRegexp = /^step_attach_(body|file)_(\w{8}-\w{4}-\w{4}-\w{4}-\w{12})_/i;
const logMimeType = 'text/plain';
const defaultSteps = ['Before Hooks', 'After Hooks', 'Worker Cleanup'];
/**
 * @class PlaywrightQaseReporter
 * @implements Reporter
 */
class PlaywrightQaseReporter {
    /**
     * @type {Record<TestStatus, TestStatusEnum>}
     */
    static statusMap = {
        passed: qase_javascript_commons_1.TestStatusEnum.passed,
        failed: qase_javascript_commons_1.TestStatusEnum.failed,
        skipped: qase_javascript_commons_1.TestStatusEnum.skipped,
        timedOut: qase_javascript_commons_1.TestStatusEnum.failed,
        interrupted: qase_javascript_commons_1.TestStatusEnum.failed,
    };
    /**
     * @type {Map<string, number[]>}
     * @private
     */
    static qaseIds = new Map();
    /**
     * @param {TestCase} test
     * @returns {string[]}
     * @private
     */
    static transformSuiteTitle(test) {
        return test.titlePath().filter(Boolean);
    }
    /**
     * @type {Map<TestStep, TestCase>}
     * @private
     */
    stepCache = new Map();
    /**
     * @type {Map<string, TestStep>}
     * @private
     */
    stepAttachments = new Map();
    /**
     * @param {ArrayItemType<TestResult['attachments']>[]} testAttachments
     * @returns {TestCaseMetadata}
     * @private
     */
    transformAttachments(testAttachments) {
        const metadata = {
            ids: [],
            title: '',
            fields: {},
            parameters: {},
            groupParams: {},
            attachments: [],
            ignore: false,
            suite: '',
            comment: '',
        };
        const attachments = [];
        for (const attachment of testAttachments) {
            if (attachment.contentType === playwright_1.ReporterContentType) {
                if (attachment.body == undefined) {
                    continue;
                }
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const message = JSON.parse(attachment.body.toString());
                if (message.title) {
                    metadata.title = message.title;
                }
                if (message.ids) {
                    metadata.ids = message.ids;
                }
                if (message.fields) {
                    metadata.fields = message.fields;
                }
                if (message.parameters) {
                    metadata.parameters = message.parameters;
                }
                if (message.ignore) {
                    metadata.ignore = message.ignore;
                }
                if (message.suite) {
                    metadata.suite = message.suite;
                }
                if (message.comment) {
                    metadata.comment = message.comment;
                }
                if (message.groupParams) {
                    metadata.groupParams = message.groupParams;
                }
                continue;
            }
            const matches = attachment.name.match(stepAttachRegexp);
            if (matches) {
                const step = [...this.stepCache.keys()].find((step) => step.title === attachment.name);
                if (step) {
                    this.stepCache.delete(step);
                }
                let attachmentModel;
                if (attachment.name.match(/^step_attach_body_/i)) {
                    attachmentModel = {
                        content: attachment.body == undefined ? '' : attachment.body,
                        file_name: decodeURIComponent(attachment.name.substring(matches[0].length)),
                        file_path: null,
                        mime_type: attachment.contentType,
                        size: attachment.body == undefined ? 0 : Buffer.byteLength(attachment.body),
                        id: (0, uuid_1.v4)(),
                    };
                }
                else {
                    attachmentModel = {
                        content: '',
                        file_name: decodeURIComponent(attachment.name.substring(matches[0].length)),
                        file_path: attachment.body != undefined ? attachment.body.toString() : null,
                        mime_type: attachment.contentType,
                        size: 0,
                        id: (0, uuid_1.v4)(),
                    };
                }
                if (step?.parent) {
                    if (!this.stepAttachments.has(step.parent)) {
                        this.stepAttachments.set(step.parent, [attachmentModel]);
                        continue;
                    }
                    const stepAttachs = this.stepAttachments.get(step.parent);
                    if (stepAttachs) {
                        stepAttachs.push(attachmentModel);
                        this.stepAttachments.set(step.parent, stepAttachs);
                    }
                    continue;
                }
                attachments.push(attachmentModel);
                continue;
            }
            const attachmentModel = {
                content: attachment.body == undefined ? '' : attachment.body,
                file_name: attachment.path == undefined ? attachment.name : path.basename(attachment.path),
                file_path: attachment.path == undefined ? null : attachment.path,
                mime_type: attachment.contentType,
                size: 0,
                id: (0, uuid_1.v4)(),
            };
            attachments.push(attachmentModel);
        }
        metadata.attachments = attachments;
        return metadata;
    }
    /**
     * @param {TestError[]} testErrors
     * @returns {Error}
     * @private
     */
    static transformError(testErrors) {
        const compoundError = new qase_javascript_commons_1.CompoundError();
        for (const error of testErrors) {
            if (error.message == undefined) {
                continue;
            }
            compoundError.addMessage(error.message);
        }
        for (const error of testErrors) {
            if (error.stack == undefined) {
                continue;
            }
            compoundError.addStacktrace(error.stack);
        }
        return compoundError;
    }
    /**
     * @param {TestStep[]} testSteps
     * @param parentId
     * @returns {TestStepType[]}
     * @private
     */
    transformSteps(testSteps, parentId) {
        const steps = [];
        for (const testStep of testSteps) {
            if ((testStep.category !== 'test.step' && testStep.category !== 'hook')
                || testStep.title.match(stepAttachRegexp)) {
                continue;
            }
            if (defaultSteps.includes(testStep.title) && this.checkChildrenSteps(testStep.steps)) {
                continue;
            }
            const attachments = this.stepAttachments.get(testStep);
            const stepData = this.extractAndCleanStep(testStep.title);
            const id = (0, uuid_1.v4)();
            const step = {
                id: id,
                step_type: qase_javascript_commons_1.StepType.TEXT,
                data: {
                    action: stepData.cleanedString,
                    expected_result: stepData.expectedResult,
                    data: stepData.data,
                },
                parent_id: parentId,
                execution: {
                    status: testStep.error ? qase_javascript_commons_1.StepStatusEnum.failed : qase_javascript_commons_1.StepStatusEnum.passed,
                    start_time: testStep.startTime.valueOf() / 1000,
                    duration: testStep.duration,
                    end_time: null,
                },
                attachments: attachments ? attachments : [],
                steps: this.transformSteps(testStep.steps, id),
            };
            steps.push(step);
        }
        return steps;
    }
    /**
     * @type {ReporterInterface}
     * @private
     */
    reporter;
    options;
    /**
     * @param {PlaywrightQaseOptionsType} options
     * @param {ConfigLoaderInterface} configLoader
     */
    constructor(options, configLoader = new qase_javascript_commons_1.ConfigLoader()) {
        const config = configLoader.load();
        const { framework, ...composedOptions } = (0, qase_javascript_commons_1.composeOptions)(options, config);
        this.options = options.framework ?? {};
        this.reporter = qase_javascript_commons_1.QaseReporter.getInstance({
            ...composedOptions,
            frameworkPackage: '@playwright/test',
            frameworkName: 'playwright',
            reporterName: 'playwright-qase-reporter',
        });
    }
    /**
     * @param {TestCase} test
     * @param _result
     * @param step
     */
    onStepBegin(test, _result, step) {
        if (step.category !== 'test.step') {
            return;
        }
        if (this.stepCache.get(step)) {
            return;
        }
        this.stepCache.set(step, test);
    }
    onBegin() {
        this.reporter.startTestRun();
    }
    /**
     * @param {TestCase} test
     * @param {TestResult} result
     */
    async onTestEnd(test, result) {
        const testCaseMetadata = this.transformAttachments(result.attachments);
        if (testCaseMetadata.ignore) {
            return;
        }
        const error = result.error ? PlaywrightQaseReporter.transformError(result.errors) : null;
        const extractedSuites = this.extractSuiteFromAnnotation(test.annotations);
        let suites = extractedSuites.length > 0
            ? extractedSuites
            : (testCaseMetadata.suite ? [testCaseMetadata.suite] : PlaywrightQaseReporter.transformSuiteTitle(test));
        let message = null;
        if (testCaseMetadata.comment !== '') {
            message = testCaseMetadata.comment;
        }
        if (error) {
            if (message) {
                message += '\n\n';
            }
            else {
                message = '';
            }
            message += error.message;
        }
        if (this.options.browser?.addAsParameter) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
            const browser = test._projectId ?? null;
            if (browser) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                testCaseMetadata.parameters[this.options.browser?.parameterName ?? 'browser'] = browser;
                suites = suites.filter(suite => suite !== browser);
            }
        }
        // if markAsFlaky is true and the test passed after retries, mark the test as flaky
        if (this.options.markAsFlaky && result.status === 'passed' && result.retry > 0) {
            testCaseMetadata.fields['is_flaky'] = 'true';
        }
        const testTitle = this.removeQaseIdsFromTitle(test.title);
        const testResult = {
            attachments: testCaseMetadata.attachments,
            author: null,
            execution: {
                status: PlaywrightQaseReporter.statusMap[result.status],
                start_time: result.startTime.valueOf() / 1000,
                end_time: null,
                duration: result.duration,
                stacktrace: error === null ?
                    null : error.stacktrace === undefined ?
                    null : error.stacktrace,
                thread: result.parallelIndex.toString(),
            },
            fields: testCaseMetadata.fields,
            id: (0, uuid_1.v4)(),
            message: message,
            muted: false,
            params: testCaseMetadata.parameters,
            group_params: testCaseMetadata.groupParams,
            relations: {
                suite: {
                    data: suites.filter((suite) => {
                        return suite != test.title;
                    }).map((suite) => {
                        return {
                            title: suite,
                            public_id: null,
                        };
                    }),
                },
            },
            run_id: null,
            signature: '',
            steps: this.transformSteps(result.steps, null),
            testops_id: null,
            title: testCaseMetadata.title === '' ? testTitle : testCaseMetadata.title,
        };
        if (this.reporter.isCaptureLogs()) {
            if (result.stdout.length > 0) {
                testResult.attachments.push(this.convertLogsToAttachments(result.stdout, 'stdout.log'));
            }
            if (result.stderr.length > 0) {
                testResult.attachments.push(this.convertLogsToAttachments(result.stderr, 'stderr.log'));
            }
        }
        const ids = this.extractQaseIdsFromAnnotation(test.annotations);
        if (ids.length > 0) {
            testResult.testops_id = ids;
        }
        else if (testCaseMetadata.ids.length > 0) {
            testResult.testops_id = testCaseMetadata.ids;
        }
        else {
            testResult.testops_id = PlaywrightQaseReporter.qaseIds.get(test.title) ?? null;
        }
        testResult.signature = (0, qase_javascript_commons_1.generateSignature)(testResult.testops_id, suites, testCaseMetadata.parameters);
        await this.reporter.addTestResult(testResult);
    }
    /**
     * @returns {Promise<void>}
     */
    async onEnd() {
        await this.reporter.publish();
    }
    // add this method for supporting old version of qase
    static addIds(ids, title) {
        this.qaseIds.set(title, ids);
    }
    /**
     * @param {(string | Buffer)[]} logs
     * @param {string} name
     * @returns {Attachment}
     * @private
     */
    convertLogsToAttachments(logs, name) {
        let content = '';
        for (const line of logs) {
            content = content + line.toString();
        }
        return {
            file_name: name,
            mime_type: logMimeType,
            content: content,
        };
    }
    /**
     * @param {string} title
     * @returns {string}
     * @private
     */
    removeQaseIdsFromTitle(title) {
        const matches = title.match(/\(Qase ID: ([0-9,]+)\)$/i);
        if (matches) {
            return title.replace(matches[0], '').trimEnd();
        }
        return title;
    }
    /**
     * @param annotation
     * @returns {number[]}
     * @private
     */
    extractQaseIdsFromAnnotation(annotation) {
        const ids = [];
        for (const item of annotation) {
            if (item.type.toLowerCase() === 'qaseid' && item.description) {
                if (item.description.includes(',')) {
                    ids.push(...item.description.split(',').map((id) => parseInt(id)));
                    continue;
                }
                ids.push(parseInt(item.description));
            }
        }
        return ids;
    }
    /**
     * @param annotation
     * @returns {string[]}
     * @private
     */
    extractSuiteFromAnnotation(annotation) {
        const suites = [];
        for (const item of annotation) {
            if (item.type.toLowerCase() === 'qasesuite' && item.description) {
                suites.push(item.description);
            }
        }
        return suites;
    }
    /**
     * @param {TestStep[]} steps
     * @returns {boolean}
     * @private
     */
    checkChildrenSteps(steps) {
        if (steps.length === 0) {
            return true;
        }
        for (const step of steps) {
            if (step.category === 'test.step' || step.category === 'hook') {
                return false;
            }
        }
        return true;
    }
    extractAndCleanStep(input) {
        let expectedResult = null;
        let data = null;
        let cleanedString = input;
        const hasExpectedResult = input.includes('QaseExpRes:');
        const hasData = input.includes('QaseData:');
        if (hasExpectedResult || hasData) {
            const regex = /QaseExpRes:\s*:?\s*(.*?)\s*(?=QaseData:|$)QaseData:\s*:?\s*(.*)?/;
            const match = input.match(regex);
            if (match) {
                expectedResult = match[1]?.trim() ?? null;
                data = match[2]?.trim() ?? null;
                cleanedString = input
                    .replace(/QaseExpRes:\s*:?\s*.*?(?=QaseData:|$)/, '')
                    .replace(/QaseData:\s*:?\s*.*/, '')
                    .trim();
            }
        }
        return { expectedResult, data, cleanedString };
    }
}
exports.PlaywrightQaseReporter = PlaywrightQaseReporter;

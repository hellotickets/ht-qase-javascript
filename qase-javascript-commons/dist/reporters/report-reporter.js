"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportReporter = void 0;
const abstract_reporter_1 = require("./abstract-reporter");
const models_1 = require("../models");
const hostData_1 = require("../utils/hostData");
/**
 * @class ReportReporter
 * @extends AbstractReporter
 */
class ReportReporter extends abstract_reporter_1.AbstractReporter {
    writer;
    frameworkName;
    reporterName;
    environment;
    runId;
    rootSuite;
    startTime = Date.now();
    /**
     * @param {LoggerInterface} logger
     * @param {WriterInterface} writer
     * @param {string} frameworkName
     * @param {string} reporterName
     * @param {string | undefined} environment
     * @param {string | undefined} rootSuite
     * @param {number | undefined} runId
     */
    constructor(logger, writer, frameworkName, reporterName, environment, rootSuite, runId) {
        super(logger);
        this.writer = writer;
        this.frameworkName = frameworkName;
        this.reporterName = reporterName;
        this.environment = environment;
        this.runId = runId;
        this.rootSuite = rootSuite;
    }
    /**
     * @returns {Promise<void>}
     */
    // eslint-disable-next-line @typescript-eslint/require-await
    async startTestRun() {
        this.startTime = Date.now();
    }
    /**
     * @returns {Promise<void>}
     *
     */
    async publish() {
        await this.sendResults();
        await this.complete();
    }
    async sendResults() {
        this.writer.clearPreviousResults();
        for (const result of this.results) {
            if (result.attachments.length > 0) {
                result.attachments = this.writer.writeAttachment(result.attachments);
            }
            result.steps = this.copyStepAttachments(result.steps);
            result.run_id = this.runId ?? null;
            if (result.relations != null && this.rootSuite != null) {
                const data = {
                    title: this.rootSuite,
                    public_id: null,
                };
                result.relations.suite?.data.unshift(data);
            }
            else if (this.rootSuite != null) {
                result.relations = {
                    suite: {
                        data: [
                            {
                                title: this.rootSuite,
                                public_id: null,
                            },
                        ],
                    },
                };
            }
            await this.writer.writeTestResult(result);
        }
    }
    async complete() {
        this.writer.clearPreviousResults();
        const report = {
            title: 'Test report',
            execution: {
                start_time: this.startTime,
                end_time: Date.now(),
                duration: Date.now() - this.startTime,
                cumulative_duration: 0,
            },
            stats: {
                total: 0,
                passed: 0,
                failed: 0,
                skipped: 0,
                broken: 0,
                muted: 0,
            },
            results: [],
            threads: [],
            suites: [],
            environment: this.environment ?? '',
            host_data: (0, hostData_1.getHostInfo)(this.frameworkName, this.reporterName),
        };
        for (const result of this.results) {
            report.stats.total++;
            switch (result.execution.status) {
                case models_1.TestStatusEnum.passed:
                    report.stats.passed++;
                    break;
                case models_1.TestStatusEnum.failed:
                    report.stats.failed++;
                    break;
                case models_1.TestStatusEnum.skipped:
                    report.stats.skipped++;
                    break;
                case models_1.TestStatusEnum.invalid:
                    report.stats.broken++;
                    break;
                case models_1.TestStatusEnum.blocked:
                    report.stats.muted++;
                    break;
            }
            report.execution.cumulative_duration += result.execution.duration ?? 0;
            report.results.push({
                duration: result.execution.duration ?? 0,
                id: result.id,
                status: result.execution.status,
                thread: result.execution.thread,
                title: result.title,
            });
        }
        const path = await this.writer.writeReport(report);
        this.logger.log(`Report saved to ${path}`);
    }
    uploadAttachment(attachment) {
        this.writer.writeAttachment([attachment]);
        return Promise.resolve('');
    }
    /**
     * @param {TestStepType[]} steps
     * @returns {TestStepType[]}
     */
    copyStepAttachments(steps) {
        for (const step of steps) {
            if (step.attachments.length > 0) {
                step.attachments = this.writer.writeAttachment(step.attachments);
            }
            if (step.steps.length > 0) {
                step.steps = this.copyStepAttachments(step.steps);
            }
        }
        return steps;
    }
}
exports.ReportReporter = ReportReporter;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestOpsReporter = void 0;
const chalk_1 = __importDefault(require("chalk"));
const abstract_reporter_1 = require("./abstract-reporter");
const models_1 = require("../models");
const state_1 = require("../state/state");
const async_mutex_1 = require("async-mutex");
const defaultChunkSize = 200;
/**
 * @class TestOpsReporter
 * @extends AbstractReporter
 */
class TestOpsReporter extends abstract_reporter_1.AbstractReporter {
    api;
    withState;
    projectCode;
    baseUrl;
    batchSize;
    runId;
    firstIndex = 0;
    isTestRunReady = false;
    mutex = new async_mutex_1.Mutex();
    /**
     * @param {LoggerInterface} logger
     * @param {IClient} api
     * @param {boolean} withState
     * @param {string} projectCode
     * @param {string | undefined} baseUrl
     * @param {number | undefined} batchSize
     */
    constructor(logger, api, withState, projectCode, baseUrl, batchSize, runId) {
        super(logger);
        this.api = api;
        this.withState = withState;
        this.projectCode = projectCode;
        this.baseUrl = this.getBaseUrl(baseUrl);
        this.batchSize = batchSize ?? defaultChunkSize;
        this.runId = runId;
    }
    /**
     * @returns {Promise<void>}
     */
    async startTestRun() {
        await this.checkOrCreateTestRun();
    }
    /**
     * @param {TestResultType} result
     * @returns {Promise<void>}
     */
    async addTestResult(result) {
        if (result.execution.status === models_1.TestStatusEnum.failed) {
            const testOpsIds = Array.isArray(result.testops_id) ? result.testops_id : [result.testops_id];
            for (const id of testOpsIds) {
                this.showLink(id, result.title);
            }
        }
        const release = await this.mutex.acquire();
        try {
            await super.addTestResult(result);
            if (!this.isTestRunReady) {
                return;
            }
            const countOfResults = this.batchSize + this.firstIndex;
            if (this.results.length >= countOfResults) {
                const firstIndex = this.firstIndex;
                this.firstIndex = countOfResults;
                await this.publishResults(this.results.slice(firstIndex, countOfResults));
            }
        }
        finally {
            release();
        }
    }
    /**
     * @returns {Promise<void>}
     */
    async checkOrCreateTestRun() {
        const runId = await this.api.createRun();
        this.runId = runId;
        process.env['QASE_TESTOPS_RUN_ID'] = String(runId);
        if (this.withState) {
            state_1.StateManager.setRunId(runId);
        }
        this.isTestRunReady = true;
    }
    /**
     * @returns {Promise<void>}
     * @param testResults
     * @private
     */
    async publishResults(testResults) {
        if (!this.runId) {
            throw new Error('Run ID is not set');
        }
        await this.api.uploadResults(this.runId, testResults);
        this.logger.logDebug(`Results sent to Qase: ${testResults.length}`);
    }
    /**
     * @returns {Promise<void>}
     */
    async publish() {
        const release = await this.mutex.acquire();
        try {
            await this.sendResults();
        }
        finally {
            release();
        }
        await this.complete();
    }
    /**
     * @returns {Promise<void>}
     */
    async sendResults() {
        if (this.results.length === 0) {
            this.logger.log((0, chalk_1.default) `{yellow No results to send to Qase}`);
            return;
        }
        const remainingResults = this.results.slice(this.firstIndex);
        if (this.firstIndex < this.results.length) {
            if (remainingResults.length <= defaultChunkSize) {
                await this.publishResults(remainingResults);
                return;
            }
            for (let i = 0; i < remainingResults.length; i += defaultChunkSize) {
                await this.publishResults(remainingResults.slice(i, i + defaultChunkSize));
            }
        }
        // Clear results because we don't need to send them again then we use Cypress reporter
        this.results.length = 0;
    }
    /**
     * @param {Attachment} attachment
     * @returns {Promise<string>}
     */
    async uploadAttachment(attachment) {
        return await this.api.uploadAttachment(attachment);
    }
    /**
     * @returns {Promise<void>}
     */
    async complete() {
        if (!this.runId) {
            throw new Error('Run ID is not set');
        }
        await this.api.completeRun(this.runId);
        this.logger.log((0, chalk_1.default) `{green Run ${this.runId} completed}`);
    }
    /**
     * @param {string | undefined} url
     * @return string
     * @private
     */
    getBaseUrl(url) {
        if (!url || url === 'qase.io') {
            return 'https://app.qase.io';
        }
        return `https://${url.replace('api', 'app')}`;
    }
    /**
     * @param {number | null} id
     * @param {string} title
     * @return string
     * @private
     */
    prepareFailedTestLink(id, title) {
        if (!this.runId) {
            throw new Error('Run ID is not set');
        }
        const baseLink = `${this.baseUrl}/run/${this.projectCode}/dashboard/${this.runId}?source=logs&status=%5B2%5D&search=`;
        if (id) {
            return `${baseLink}${this.projectCode}-${id}`;
        }
        return `${baseLink}${encodeURI(title)}`;
    }
    /**
     * Show link to failed test
     * @param {number | null} id
     * @param {string} title
     * @private
     */
    showLink(id, title) {
        const link = this.prepareFailedTestLink(id, title);
        this.logger.log((0, chalk_1.default) `{blue See why this test failed: ${link}}`);
    }
}
exports.TestOpsReporter = TestOpsReporter;

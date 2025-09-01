"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QaseReporter = void 0;
const env_schema_1 = __importDefault(require("env-schema"));
const chalk_1 = __importDefault(require("chalk"));
const reporters_1 = require("./reporters");
const options_1 = require("./options");
const env_1 = require("./env");
const models_1 = require("./models");
const writer_1 = require("./writer");
const disabled_exception_1 = require("./utils/disabled-exception");
const logger_1 = require("./utils/logger");
const state_1 = require("./state/state");
const hostData_1 = require("./utils/hostData");
const clientV2_1 = require("./client/clientV2");
/**
 * @type {Record<TestStatusEnum, (test: TestResultType) => string>}
 */
const resultLogMap = {
    [models_1.TestStatusEnum.failed]: (test) => (0, chalk_1.default) `{red Test ${test.title} ${test.execution.status}}`,
    [models_1.TestStatusEnum.passed]: (test) => (0, chalk_1.default) `{green Test ${test.title} ${test.execution.status}}`,
    [models_1.TestStatusEnum.skipped]: (test) => (0, chalk_1.default) `{blueBright Test ${test.title} ${test.execution.status}}`,
    [models_1.TestStatusEnum.blocked]: (test) => (0, chalk_1.default) `{blueBright Test ${test.title} ${test.execution.status}}`,
    [models_1.TestStatusEnum.disabled]: (test) => (0, chalk_1.default) `{grey Test ${test.title} ${test.execution.status}}`,
    [models_1.TestStatusEnum.invalid]: (test) => (0, chalk_1.default) `{yellowBright Test ${test.title} ${test.execution.status}}`,
};
/**
 * @class QaseReporter
 * @implements AbstractReporter
 */
class QaseReporter {
    static instance;
    /**
     * @type {InternalReporterInterface}
     * @private
     */
    upstreamReporter;
    /**
     * @type {InternalReporterInterface}
     * @private
     */
    fallbackReporter;
    /**
     * @type {boolean | undefined}
     * @private
     */
    captureLogs;
    /**
     * @type {boolean}
     * @private
     */
    disabled = false;
    /**
     * @type {boolean}
     * @private
     */
    useFallback = false;
    logger;
    startTestRunOperation;
    options;
    withState;
    /**
     * @param {OptionsType} options
     */
    constructor(options) {
        this.withState = this.setWithState(options);
        if (this.withState) {
            if (state_1.StateManager.isStateExists()) {
                const state = state_1.StateManager.getState();
                if (state.IsModeChanged && state.Mode) {
                    process.env[env_1.EnvEnum.mode] = state.Mode.toString();
                }
                if (state.RunId) {
                    process.env[env_1.EnvRunEnum.id] = state.RunId.toString();
                }
            }
        }
        const env = (0, env_1.envToConfig)((0, env_schema_1.default)({ schema: env_1.envValidationSchema }));
        const composedOptions = (0, options_1.composeOptions)(options, env);
        this.options = composedOptions;
        this.logger = new logger_1.Logger({ debug: composedOptions.debug });
        this.logger.logDebug(`Config: ${JSON.stringify(this.sanitizeOptions(composedOptions))}`);
        const hostData = (0, hostData_1.getHostInfo)(options.frameworkPackage, options.reporterName);
        this.logger.logDebug(`Host data: ${JSON.stringify(hostData)}`);
        this.captureLogs = composedOptions.captureLogs;
        try {
            this.upstreamReporter = this.createReporter(
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            composedOptions.mode || options_1.ModeEnum.off, composedOptions);
        }
        catch (error) {
            if (error instanceof disabled_exception_1.DisabledException) {
                this.disabled = true;
            }
            else {
                this.logger.logError('Unable to create upstream reporter:', error);
                if (composedOptions.fallback != undefined) {
                    this.disabled = true;
                    return;
                }
                this.useFallback = true;
            }
        }
        try {
            this.fallbackReporter = this.createReporter(
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            composedOptions.fallback || options_1.ModeEnum.off, composedOptions);
        }
        catch (error) {
            if (error instanceof disabled_exception_1.DisabledException) {
                if (this.useFallback) {
                    this.disabled = true;
                }
            }
            else {
                this.logger.logError('Unable to create fallback reporter:', error);
                if (this.useFallback && this.upstreamReporter === undefined) {
                    this.disabled = true;
                }
            }
        }
        if (this.withState) {
            if (!state_1.StateManager.isStateExists()) {
                const state = {
                    RunId: undefined,
                    Mode: this.useFallback ? composedOptions.fallback : composedOptions.mode,
                    IsModeChanged: undefined,
                };
                if (this.disabled) {
                    state.Mode = options_1.ModeEnum.off;
                }
                state_1.StateManager.setState(state);
            }
        }
    }
    async uploadAttachment(attachment) {
        if (this.disabled) {
            return '';
        }
        if (this.useFallback) {
            return await this.fallbackReporter?.uploadAttachment(attachment) ?? '';
        }
        return await this.upstreamReporter?.uploadAttachment(attachment) ?? '';
    }
    getResults() {
        if (this.disabled) {
            return [];
        }
        if (this.useFallback) {
            return this.fallbackReporter?.getTestResults() ?? [];
        }
        return this.upstreamReporter?.getTestResults() ?? [];
    }
    setTestResults(results) {
        if (this.disabled) {
            return;
        }
        if (this.useFallback) {
            this.fallbackReporter?.setTestResults(results);
        }
        else {
            this.upstreamReporter?.setTestResults(results);
        }
    }
    async sendResults() {
        if (this.disabled) {
            return;
        }
        try {
            await this.upstreamReporter?.sendResults();
        }
        catch (error) {
            this.logger.logError('Unable to send the results to the upstream reporter:', error);
            if (this.fallbackReporter == undefined) {
                if (this.withState) {
                    state_1.StateManager.setMode(options_1.ModeEnum.off);
                }
                return;
            }
            if (!this.useFallback) {
                this.fallbackReporter.setTestResults(this.upstreamReporter?.getTestResults() ?? []);
                this.useFallback = true;
            }
            try {
                await this.fallbackReporter.sendResults();
                if (this.withState) {
                    state_1.StateManager.setMode(this.options.fallback);
                }
            }
            catch (error) {
                this.logger.logError('Unable to send the results to the fallback reporter:', error);
                if (this.withState) {
                    state_1.StateManager.setMode(options_1.ModeEnum.off);
                }
            }
        }
    }
    async complete() {
        if (this.withState) {
            state_1.StateManager.clearState();
        }
        if (this.disabled) {
            return;
        }
        try {
            await this.upstreamReporter?.complete();
        }
        catch (error) {
            this.logger.logError('Unable to complete the run in the upstream reporter:', error);
            if (this.fallbackReporter == undefined) {
                return;
            }
            if (!this.useFallback) {
                this.fallbackReporter.setTestResults(this.upstreamReporter?.getTestResults() ?? []);
                this.useFallback = true;
            }
            try {
                await this.fallbackReporter.complete();
            }
            catch (error) {
                this.logger.logError('Unable to complete the run in the fallback reporter:', error);
            }
        }
    }
    /**
     * @returns {void}
     */
    startTestRun() {
        if (this.withState) {
            state_1.StateManager.clearState();
        }
        if (!this.disabled) {
            this.logger.logDebug('Starting test run');
            try {
                this.startTestRunOperation = this.upstreamReporter?.startTestRun();
            }
            catch (error) {
                this.logger.logError('Unable to start test run in the upstream reporter: ', error);
                if (this.fallbackReporter == undefined) {
                    this.disabled = true;
                    if (this.withState) {
                        state_1.StateManager.setMode(options_1.ModeEnum.off);
                    }
                    return;
                }
                try {
                    this.startTestRunOperation = this.fallbackReporter.startTestRun();
                    if (this.withState) {
                        state_1.StateManager.setMode(this.options.fallback);
                    }
                }
                catch (error) {
                    this.logger.logError('Unable to start test run in the fallback reporter: ', error);
                    this.disabled = true;
                    if (this.withState) {
                        state_1.StateManager.setMode(options_1.ModeEnum.off);
                    }
                }
            }
        }
    }
    async startTestRunAsync() {
        this.startTestRun();
        await this.startTestRunOperation;
    }
    /**
     * @param {OptionsType} options
     * @returns {QaseReporter}
     */
    static getInstance(options) {
        if (!QaseReporter.instance) {
            QaseReporter.instance = new QaseReporter(options);
        }
        return QaseReporter.instance;
    }
    /**
     * @param {TestResultType} result
     */
    async addTestResult(result) {
        if (!this.disabled) {
            await this.startTestRunOperation;
            this.logTestItem(result);
            if (this.useFallback) {
                await this.addTestResultToFallback(result);
                return;
            }
            try {
                await this.upstreamReporter?.addTestResult(result);
            }
            catch (error) {
                this.logger.logError('Unable to add the result to the upstream reporter:', error);
                if (this.fallbackReporter == undefined) {
                    this.disabled = true;
                    if (this.withState) {
                        state_1.StateManager.setMode(options_1.ModeEnum.off);
                    }
                    return;
                }
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                if (!this.useFallback) {
                    this.fallbackReporter.setTestResults(this.upstreamReporter?.getTestResults() ?? []);
                    this.useFallback = true;
                }
                await this.addTestResultToFallback(result);
            }
        }
    }
    /**
     * @param {TestResultType} result
     * @private
     */
    async addTestResultToFallback(result) {
        try {
            await this.fallbackReporter?.addTestResult(result);
            if (this.withState) {
                state_1.StateManager.setMode(this.options.fallback);
            }
        }
        catch (error) {
            this.logger.logError('Unable to add the result to the fallback reporter:', error);
            this.disabled = true;
            state_1.StateManager.setMode(options_1.ModeEnum.off);
        }
    }
    /**
     * @returns {boolean}
     */
    isCaptureLogs() {
        return this.captureLogs ?? false;
    }
    /**
     * @returns {Promise<void>}
     */
    async publish() {
        if (!this.disabled) {
            await this.startTestRunOperation;
            this.logger.logDebug('Publishing test run results');
            if (this.useFallback) {
                await this.publishFallback();
            }
            try {
                await this.upstreamReporter?.publish();
            }
            catch (error) {
                this.logger.logError('Unable to publish the run results to the upstream reporter:', error);
                if (this.fallbackReporter == undefined) {
                    this.disabled = true;
                    if (this.withState) {
                        state_1.StateManager.setMode(options_1.ModeEnum.off);
                    }
                    return;
                }
                if (!this.useFallback) {
                    this.fallbackReporter.setTestResults(this.upstreamReporter?.getTestResults() ?? []);
                    this.useFallback = true;
                }
                await this.publishFallback();
            }
        }
        if (this.withState) {
            state_1.StateManager.clearState();
        }
    }
    /**
     * @returns {Promise<void>}
     */
    async publishFallback() {
        try {
            await this.fallbackReporter?.publish();
            if (this.withState) {
                state_1.StateManager.setMode(this.options.fallback);
            }
        }
        catch (error) {
            if (this.withState) {
                state_1.StateManager.setMode(options_1.ModeEnum.off);
            }
            this.logger.logError('Unable to publish the run results to the fallback reporter:', error);
            this.disabled = true;
        }
    }
    /**
     * @todo implement mode registry
     * @param {ModeEnum} mode
     * @param {OptionsType} options
     * @returns {InternalReporterInterface}
     * @private
     */
    createReporter(mode, options) {
        switch (mode) {
            case options_1.ModeEnum.testops: {
                if (!options.testops?.api?.token) {
                    throw new Error(`Either "testops.api.token" parameter or "${env_1.EnvApiEnum.token}" environment variable is required in "testops" mode`);
                }
                if (!options.testops.project) {
                    throw new Error(`Either "testops.project" parameter or "${env_1.EnvTestOpsEnum.project}" environment variable is required in "testops" mode`);
                }
                const apiClient = new clientV2_1.ClientV2(this.logger, options.testops, options.environment, options.rootSuite);
                return new reporters_1.TestOpsReporter(this.logger, apiClient, this.withState, options.testops.project, options.testops.api.host, options.testops.batch?.size, options.testops.run?.id);
            }
            case options_1.ModeEnum.report: {
                const localOptions = options.report?.connections?.[writer_1.DriverEnum.local];
                const writer = new writer_1.FsWriter(localOptions);
                return new reporters_1.ReportReporter(this.logger, writer, options.frameworkPackage, options.reporterName, options.environment, options.rootSuite, options.testops?.run?.id);
            }
            case options_1.ModeEnum.off:
                throw new disabled_exception_1.DisabledException();
            default:
                throw new Error(`Unknown mode type`);
        }
    }
    /**
     * @param {TestResultType} test
     * @private
     */
    logTestItem(test) {
        this.logger.log(resultLogMap[test.execution.status](test));
    }
    setWithState(options) {
        return options.frameworkName === 'cypress' || !options.frameworkName;
    }
    maskToken(token) {
        if (token.length <= 7) {
            return '*'.repeat(token.length);
        }
        return `${token.slice(0, 3)}****${token.slice(-4)}`;
    }
    sanitizeOptions(options) {
        const sanitized = JSON.parse(JSON.stringify(options));
        if (sanitized.testops?.api?.token) {
            sanitized.testops.api.token = this.maskToken(sanitized.testops.api.token);
        }
        return sanitized;
    }
}
exports.QaseReporter = QaseReporter;

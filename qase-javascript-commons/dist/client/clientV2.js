"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientV2 = void 0;
const chalk_1 = __importDefault(require("chalk"));
const qase_api_v2_client_1 = require("qase-api-v2-client");
const models_1 = require("../models");
const clientV1_1 = require("./clientV1");
const form_data_1 = __importDefault(require("form-data"));
const API_CONFIG = {
    DEFAULT_HOST: 'qase.io',
    BASE_URL: 'https://api-',
    VERSION: '/v2'
};
class ClientV2 extends clientV1_1.ClientV1 {
    rootSuite;
    static statusMap = {
        [models_1.TestStatusEnum.passed]: 'passed',
        [models_1.TestStatusEnum.failed]: 'failed',
        [models_1.TestStatusEnum.skipped]: 'skipped',
        [models_1.TestStatusEnum.disabled]: 'disabled',
        [models_1.TestStatusEnum.blocked]: 'blocked',
        [models_1.TestStatusEnum.invalid]: 'invalid',
    };
    static stepStatusMap = {
        [models_1.StepStatusEnum.passed]: qase_api_v2_client_1.ResultStepStatus.PASSED,
        [models_1.StepStatusEnum.failed]: qase_api_v2_client_1.ResultStepStatus.FAILED,
        [models_1.StepStatusEnum.blocked]: qase_api_v2_client_1.ResultStepStatus.BLOCKED,
        [models_1.StepStatusEnum.skipped]: qase_api_v2_client_1.ResultStepStatus.SKIPPED,
    };
    resultsClient;
    constructor(logger, config, environment, rootSuite) {
        super(logger, config, environment);
        this.rootSuite = rootSuite;
        const apiConfig = this.createApiConfigV2();
        this.resultsClient = new qase_api_v2_client_1.ResultsApi(apiConfig);
    }
    createApiConfigV2() {
        const apiConfig = new qase_api_v2_client_1.Configuration({ apiKey: this.config.api.token, formDataCtor: form_data_1.default });
        apiConfig.basePath = this.config.api.host && this.config.api.host != API_CONFIG.DEFAULT_HOST
            ? `${API_CONFIG.BASE_URL}${this.config.api.host}${API_CONFIG.VERSION}`
            : `https://api.${API_CONFIG.DEFAULT_HOST}${API_CONFIG.VERSION}`;
        return apiConfig;
    }
    async uploadResults(runId, results) {
        try {
            const models = await Promise.all(results.map(result => this.transformTestResult(result)));
            await this.resultsClient.createResultsV2(this.config.project, runId, {
                results: models,
            });
        }
        catch (error) {
            throw this.processError(error, 'Error on uploading results', results);
        }
    }
    async transformTestResult(result) {
        const attachments = await this.uploadAttachments(result.attachments);
        if (result.preparedAttachments) {
            attachments.push(...result.preparedAttachments);
        }
        const steps = await this.transformSteps(result.steps, result.title);
        const params = this.transformParams(result.params);
        const groupParams = this.transformGroupParams(result.group_params, params);
        const relations = this.getRelation(result.relations);
        const model = {
            title: result.title,
            execution: this.getExecution(result.execution),
            testops_ids: Array.isArray(result.testops_id)
                ? result.testops_id
                : result.testops_id !== null ? [result.testops_id] : null,
            attachments: attachments,
            steps: steps,
            params: params,
            param_groups: groupParams,
            relations: relations,
            message: result.message,
            fields: result.fields,
            defect: this.config.defect ?? false,
            signature: result.signature,
        };
        this.logger.logDebug(`Transformed result: ${JSON.stringify(model)}`);
        return model;
    }
    transformParams(params) {
        const transformedParams = {};
        for (const [key, value] of Object.entries(params)) {
            if (value) {
                transformedParams[key] = value;
            }
        }
        return transformedParams;
    }
    transformGroupParams(groupParams, params) {
        const keys = Object.keys(groupParams);
        if (keys.length === 0) {
            return [];
        }
        for (const [key, value] of Object.entries(groupParams)) {
            if (value) {
                params[key] = value;
            }
        }
        return [keys];
    }
    async transformSteps(steps, testTitle) {
        return Promise.all(steps.map(step => this.transformStep(step, testTitle)));
    }
    async transformStep(step, testTitle) {
        const attachmentHashes = await this.uploadAttachments(step.attachments);
        const resultStep = this.createBaseResultStep(attachmentHashes, step.execution.status);
        if (step.step_type === models_1.StepType.TEXT) {
            this.processTextStep(step, resultStep, testTitle);
        }
        else {
            this.processGherkinStep(step, resultStep);
        }
        if (step.steps.length > 0) {
            resultStep.steps = await this.transformSteps(step.steps, testTitle);
        }
        return resultStep;
    }
    createBaseResultStep(attachmentHashes, status) {
        return {
            data: {
                action: '',
            },
            execution: {
                status: ClientV2.stepStatusMap[status],
                attachments: attachmentHashes,
            },
        };
    }
    processTextStep(step, resultStep, testTitle) {
        if (!('action' in step.data) || !resultStep.data) {
            return;
        }
        const stepData = step.data;
        resultStep.data.action = stepData.action || 'Unnamed step';
        if (stepData.action === '') {
            this.logger.log((0, chalk_1.default) `{magenta Test '${testTitle}' has empty action in step. The reporter will mark this step as unnamed step.}`);
        }
        if (stepData.expected_result != null) {
            resultStep.data.expected_result = stepData.expected_result;
        }
        if (stepData.data != null) {
            resultStep.data.input_data = stepData.data;
        }
    }
    processGherkinStep(step, resultStep) {
        if (!('keyword' in step.data) || !resultStep.data) {
            return;
        }
        const stepData = step.data;
        resultStep.data.action = stepData.keyword;
    }
    getExecution(exec) {
        return {
            status: ClientV2.statusMap[exec.status],
            start_time: exec.start_time,
            end_time: exec.end_time,
            duration: exec.duration,
            stacktrace: exec.stacktrace,
            thread: exec.thread,
        };
    }
    getRelation(relation) {
        if (!relation?.suite) {
            return this.getDefaultSuiteRelation();
        }
        const suiteData = this.buildSuiteData(relation.suite.data);
        return { suite: { data: suiteData } };
    }
    getDefaultSuiteRelation() {
        if (!this.rootSuite)
            return {};
        return {
            suite: {
                data: [{
                        public_id: null,
                        title: this.rootSuite,
                    }],
            },
        };
    }
    buildSuiteData(suiteData) {
        const result = [];
        if (this.rootSuite) {
            result.push({
                public_id: null,
                title: this.rootSuite,
            });
        }
        return result.concat(suiteData.map(data => ({
            public_id: null,
            title: data.title,
        })));
    }
}
exports.ClientV2 = ClientV2;

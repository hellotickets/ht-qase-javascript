import { ResultStepStatus } from "qase-api-v2-client";
import { StepStatusEnum, TestResultType, TestStatusEnum } from "../models";
import { LoggerInterface } from "../utils/logger";
import { ClientV1 } from "./clientV1";
import { TestOpsOptionsType } from "../models/config/TestOpsOptionsType";
export declare class ClientV2 extends ClientV1 {
    private readonly rootSuite;
    static statusMap: Record<TestStatusEnum, string>;
    static stepStatusMap: Record<StepStatusEnum, ResultStepStatus>;
    private readonly resultsClient;
    constructor(logger: LoggerInterface, config: TestOpsOptionsType, environment: string | undefined, rootSuite: string | undefined);
    private createApiConfigV2;
    uploadResults(runId: number, results: TestResultType[]): Promise<void>;
    private transformTestResult;
    private transformParams;
    private transformGroupParams;
    private transformSteps;
    private transformStep;
    private createBaseResultStep;
    private processTextStep;
    private processGherkinStep;
    private getExecution;
    private getRelation;
    private getDefaultSuiteRelation;
    private buildSuiteData;
}

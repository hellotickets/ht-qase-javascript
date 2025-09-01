import { TestStepType } from './test-step';
import { Attachment } from './attachment';
import { TestExecution } from './test-execution';
export declare class TestResultType {
    id: string;
    title: string;
    signature: string;
    run_id: number | null;
    testops_id: number | number[] | null;
    execution: TestExecution;
    fields: Record<string, string>;
    attachments: Attachment[];
    steps: TestStepType[];
    params: Record<string, string>;
    group_params: Record<string, string>;
    author: string | null;
    relations: Relation | null;
    muted: boolean;
    message: string | null;
    preparedAttachments?: string[];
    constructor(title: string);
}
export interface Relation {
    suite?: Suite;
}
export interface Suite {
    data: SuiteData[];
}
export interface SuiteData {
    title: string;
    public_id: number | null;
}

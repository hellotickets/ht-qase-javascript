import { StepGherkinData, StepTextData } from './step-data';
import { StepExecution } from './step-execution';
import { Attachment } from './attachment';
export declare enum StepType {
    TEXT = "text",
    GHERKIN = "gherkin"
}
export declare class TestStepType {
    id: string;
    step_type: StepType;
    data: StepTextData | StepGherkinData;
    parent_id: string | null;
    execution: StepExecution;
    attachments: Attachment[];
    steps: TestStepType[];
    constructor(type?: StepType);
}

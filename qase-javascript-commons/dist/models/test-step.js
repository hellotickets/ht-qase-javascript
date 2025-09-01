"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestStepType = exports.StepType = void 0;
const step_execution_1 = require("./step-execution");
var StepType;
(function (StepType) {
    StepType["TEXT"] = "text";
    StepType["GHERKIN"] = "gherkin";
})(StepType || (exports.StepType = StepType = {}));
class TestStepType {
    id;
    step_type;
    data;
    parent_id;
    execution;
    attachments;
    steps;
    constructor(type = StepType.TEXT) {
        this.id = '';
        this.step_type = type;
        this.parent_id = null;
        this.execution = new step_execution_1.StepExecution();
        this.attachments = [];
        this.steps = [];
        if (type === StepType.TEXT) {
            this.data = {
                action: '',
                expected_result: null,
                data: null,
            };
        }
        else {
            this.data = {
                keyword: '',
                name: '',
                line: 0,
            };
        }
    }
}
exports.TestStepType = TestStepType;

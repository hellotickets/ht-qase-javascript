"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestResultType = void 0;
const test_execution_1 = require("./test-execution");
class TestResultType {
    id;
    title;
    signature;
    run_id;
    testops_id;
    execution;
    fields;
    attachments;
    steps;
    params;
    group_params;
    author;
    relations;
    muted;
    message;
    preparedAttachments;
    constructor(title) {
        this.id = '';
        this.title = title;
        this.signature = '';
        this.run_id = null;
        this.testops_id = null;
        this.execution = new test_execution_1.TestExecution();
        this.fields = {};
        this.attachments = [];
        this.steps = [];
        this.params = {};
        this.group_params = {};
        this.author = null;
        this.relations = null;
        this.muted = false;
        this.message = null;
        this.preparedAttachments = [];
    }
}
exports.TestResultType = TestResultType;

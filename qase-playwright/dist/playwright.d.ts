/// <reference types="node" />
export declare const ReporterContentType = "application/qase.metadata+json";
export interface MetadataMessage {
    ids?: number[];
    title?: string;
    fields?: Record<string, string>;
    parameters?: Record<string, string>;
    groupParams?: Record<string, string>;
    ignore?: boolean;
    suite?: string;
    comment?: string;
}
/**
 * Set IDs for the test case
 *
 * @param caseId
 * @param name
 * @example
 * test(qase(1, 'test'), async ({ page }) => {
 *  await page.goto('https://example.com');
 * });
 * @returns {string}
 */
export declare const qase: {
    (caseId: number | string | number[] | string[], name: string): string;
    /**
     * Set IDs for the test case
     * Use `qase()` instead. This method is deprecated and kept for reverse compatibility.
     *
     * @param {number | number[]} value
     *
     * @example
     * test('test', async ({ page }) => {
     *    qase.id(1);
     *    await page.goto('https://example.com');
     * });
     *
     */
    id(value: number | number[]): any;
    /**
     * Set a title for the test case
     * @param {string} value
     * @example
     * test('test', async ({ page }) => {
     *    qase.title("Title");
     *    await page.goto('https://example.com');
     * });
     */
    title(value: string): any;
    /**
     * Set fields for the test case
     * @param {Record<string, string>[]} values
     * @example
     * test('test', async ({ page }) => {
     *    qase.fields({ 'severity': 'high', 'priority': 'medium' });
     *    await page.goto('https://example.com');
     * });
     */
    fields(values: Record<string, string>): any;
    /**
     * Set parameters for the test case
     * @param {Record<string, string>[]} values
     * @example
     * for (const value of values) {
     *    test('test', async ({ page }) => {
     *      qase.parameters({ 'parameter': value });
     *      await page.goto('https://example.com');
     *    });
     * )
     */
    parameters(values: Record<string, string>): any;
    /**
     * Set group parameters for the test case.
     * All parameters will be grouped as a single entity.
     * @param {Record<string, string>[]} values
     * @example
     * for (const value of values) {
     *    test('test', async ({ page }) => {
     *      qase.groupParameters({ 'parameter': value });
     *      await page.goto('https://example.com');
     *    });
     * )
     */
    groupParameters(values: Record<string, string>): any;
    /**
     * Attach a file to the test case or the step
     * @param attach
     * @example
     * test('test', async ({ page }) => {
     *   qase.attach({ name: 'attachment.txt', content: 'Hello, world!', contentType: 'text/plain' });
     *   qase.attach({ paths: '/path/to/file'});
     *   qase.attach({ paths: ['/path/to/file', '/path/to/another/file']});
     *   await page.goto('https://example.com');
     *  });
     */
    attach(attach: {
        name?: string;
        paths?: string | string[];
        content?: Buffer | string;
        contentType?: string;
    }): any;
    /**
     * Ignore the test case result in Qase
     * @example
     * test('test', async ({ page }) => {
     *   qase.ignore();
     *   await page.goto('https://example.com');
     * });
     */
    ignore(): any;
    /**
     * Set a suite for the test case
     * @param {string} value
     * @example
     * test('test', async ({ page }) => {
     *    qase.suite("Suite");
     *    await page.goto('https://example.com');
     * });
     */
    suite(value: string): any;
    /**
     * Set a comment for the test case
     * @param {string} value
     * @example
     * test('test', async ({ page }) => {
     *    qase.comment("Comment");
     *    await page.goto('https://example.com');
     * });
     */
    comment(value: string): any;
    /**
     * Set a expected result and data for the test step
     * @param action
     * @param expectedResult
     * @param data
     * @example
     * test('test', async ({ page }) => {
     *    await test.step(qase.step('action', 'expected result', 'data'), async () => {
     *      await page.goto('https://example.com');
     *    });
     * });
     */
    step(action: string, expectedResult: string | undefined, data: string | undefined): string;
};

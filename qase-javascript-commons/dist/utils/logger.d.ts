export interface LoggerInterface {
    log(message: string): void;
    logError(message: string, error?: unknown): void;
    logDebug(message: string): void;
}
export declare class Logger implements LoggerInterface {
    private readonly debug;
    private readonly filePath;
    constructor(options: {
        debug?: boolean | undefined;
        dir?: string;
    });
    log(message: string): void;
    logError(message: string, error?: unknown): void;
    logDebug(message: string): void;
    private logToFile;
    private doLogError;
    /**
     * @param {AxiosError} error
     * @private
     */
    private logApiError;
    /**
     * @param errorFields
     * @returns {string | undefined}
     * @private
     */
    private formatErrorFields;
}

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHostInfo = void 0;
const os = __importStar(require("os"));
const cp = __importStar(require("child_process"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
/**
 * Gets detailed OS information based on the platform
 * @returns {string} Detailed OS information
 */
function getDetailedOSInfo() {
    const platform = process.platform;
    try {
        if (platform === 'win32') {
            // Windows
            return cp.execSync('ver').toString().trim();
        }
        else if (platform === 'darwin') {
            // macOS
            return cp.execSync('sw_vers -productVersion').toString().trim();
        }
        else {
            // Linux and others
            try {
                const osRelease = fs.readFileSync('/etc/os-release', 'utf8');
                const prettyName = osRelease.match(/PRETTY_NAME="(.+)"/);
                if (prettyName?.[1]) {
                    return prettyName[1];
                }
            }
            catch {
                // Fallback if /etc/os-release doesn't exist or can't be read
            }
            return os.release();
        }
    }
    catch (error) {
        console.error('Error getting detailed OS info:', error);
        return os.release();
    }
}
/**
 * Executes a command and returns its trimmed output
 * @param {string} command Command to execute
 * @param {string} defaultValue Default value if command fails
 * @returns {string} Command output or default value
 */
function execCommand(command, defaultValue = '') {
    try {
        return cp.execSync(command).toString().trim();
    }
    catch (error) {
        console.error(`Error executing command '${command}':`, error);
        return defaultValue;
    }
}
/**
 * Recursively searches for a package in dependencies tree
 * @param {Record<string, PackageInfo>} dependencies The dependencies object to search in
 * @param {string} packageName The name of the package to find
 * @returns {string | null} The package version or null if not found
 */
function findPackageInDependencies(dependencies, packageName) {
    // If no dependencies, return null
    if (!dependencies)
        return null;
    // Check if the package exists at the current level
    if (packageName in dependencies) {
        return dependencies[packageName]?.version ?? null;
    }
    // Recursively search in nested dependencies
    for (const dep of Object.values(dependencies)) {
        if (dep.dependencies) {
            const foundVersion = findPackageInDependencies(dep.dependencies, packageName);
            if (foundVersion) {
                return foundVersion;
            }
        }
    }
    return null;
}
/**
 * Gets the version of a Node.js package
 * @param {string} packageName The name of the package
 * @returns {string | null} The package version or null if not found
 */
function getPackageVersion(packageName) {
    if (!packageName)
        return null;
    try {
        // First try to get from node_modules
        const packagePath = path.resolve(process.cwd(), 'node_modules', packageName, 'package.json');
        if (fs.existsSync(packagePath)) {
            const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            return packageJson.version;
        }
        // Try using npm list as fallback with recursive search
        let output = null;
        try {
            output = (0, child_process_1.execSync)(`npm list --depth=10 --json`, { stdio: "pipe" }).toString();
            if (!output)
                return null;
        }
        catch (error) {
            return null;
        }
        try {
            const npmList = JSON.parse(output);
            // Try direct dependency
            const directVersion = npmList.dependencies?.[packageName]?.version;
            if (directVersion)
                return directVersion;
            // Try recursive search
            return findPackageInDependencies(npmList.dependencies, packageName);
        }
        catch (parseError) {
            console.error('Error parsing npm list output:', parseError);
            return null;
        }
    }
    catch (error) {
        console.error(`Error getting version for package ${packageName}:`, error);
        return null;
    }
}
/**
 * Gets information about the current host environment
 * @param {string} framework The framework name to check version for
 * @param {string} reporterName The reporter name to check version for
 * @returns {HostData} Host information object
 */
function getHostInfo(framework, reporterName) {
    try {
        return {
            system: process.platform,
            machineName: os.hostname(),
            release: os.release(),
            version: getDetailedOSInfo(),
            arch: os.arch(),
            node: execCommand('node --version'),
            npm: execCommand('npm --version'),
            framework: getPackageVersion(framework) ?? '',
            reporter: getPackageVersion(reporterName) ?? '',
            commons: getPackageVersion('qase-javascript-commons') ?? '',
            apiClientV1: getPackageVersion('qase-api-client') ?? '',
            apiClientV2: getPackageVersion('qase-api-v2-client') ?? '',
        };
    }
    catch (error) {
        return {
            system: process.platform,
            machineName: os.hostname() || '',
            release: os.release(),
            version: '',
            arch: os.arch(),
            node: '',
            npm: '',
            framework: '',
            reporter: '',
            commons: '',
            apiClientV1: '',
            apiClientV2: '',
        };
    }
}
exports.getHostInfo = getHostInfo;

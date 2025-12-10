var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { McpUnityError, ErrorType } from '../../utils/errors.js';
/**
 * Tool for running Unity Test Runner tests
 *
 * Uses Unity's TestRunnerApi to execute EditMode or PlayMode tests.
 *
 * Unity API: UnityEditor.TestTools.TestRunner.Api.TestRunnerApi
 * C# Handler: Editor/Tools/RunTestsTool.cs
 *
 * @see https://docs.unity3d.com/Packages/com.unity.test-framework@latest
 *
 * @example
 * // Run all EditMode tests
 * { testMode: "EditMode" }
 *
 * @example
 * // Run specific test with filter
 * { testMode: "EditMode", testFilter: "MyNamespace.MyTestClass.MyTestMethod" }
 *
 * @category testing
 */
let RunTestsTool = (() => {
    let _classDecorators = [Tool({
            name: 'run_tests',
            description: 'Runs Unity\'s Test Runner tests',
            category: 'testing',
            version: '1.0.0'
        }), Tags(['unity', 'testing', 'test-runner'])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseTool;
    var RunTestsTool = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            RunTestsTool = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        get name() {
            return 'run_tests';
        }
        get description() {
            return 'Runs Unity\'s Test Runner tests';
        }
        get category() {
            return 'testing';
        }
        get inputSchema() {
            return z.object({
                testMode: z.string().optional().default('EditMode').describe('The test mode to run (EditMode or PlayMode) - defaults to EditMode (optional)'),
                testFilter: z.string().optional().default('').describe('The specific test filter to run (e.g. specific test name or class name, must include namespace) (optional)'),
                returnOnlyFailures: z.boolean().optional().default(true).describe('Whether to show only failed tests in the results (optional)'),
                returnWithLogs: z.boolean().optional().default(false).describe('Whether to return the test logs in the results (optional)')
            });
        }
        /**
         * Custom execution logic preserved from legacy implementation
         * Handles test execution and formats results with detailed statistics
         */
        async execute(args) {
            try {
                // Validate arguments
                const validatedArgs = this.inputSchema.parse(args);
                // Extract parameters with defaults
                const { testMode = 'EditMode', testFilter = '', returnOnlyFailures = true, returnWithLogs = false } = validatedArgs;
                this.logger.debug(`Executing ${this.name}`, { testMode, testFilter, returnOnlyFailures, returnWithLogs });
                // Send request to Unity
                const response = await this.mcpUnity.sendRequest({
                    method: this.name,
                    params: {
                        testMode,
                        testFilter,
                        returnOnlyFailures,
                        returnWithLogs
                    }
                });
                // Check if execution was successful
                if (!response.success) {
                    throw new McpUnityError(ErrorType.TOOL_EXECUTION, response.message || `Failed to run tests: Mode=${testMode}, Filter=${testFilter || 'none'}`);
                }
                // Extract test results
                const testResults = response.results || [];
                const testCount = response.testCount || 0;
                const passCount = response.passCount || 0;
                const failCount = response.failCount || 0;
                const skipCount = response.skipCount || 0;
                // Return formatted response with test statistics
                return {
                    content: [
                        {
                            type: 'text',
                            text: response.message
                        },
                        {
                            type: 'text',
                            text: JSON.stringify({
                                testCount,
                                passCount,
                                failCount,
                                skipCount,
                                results: testResults
                            }, null, 2)
                        }
                    ]
                };
            }
            catch (error) {
                this.logger.error(`Error in ${this.name}:`, error);
                // Preserve error type if it's already a McpUnityError
                if (error instanceof McpUnityError) {
                    throw error;
                }
                return this.formatErrorResponse(error);
            }
        }
    };
    return RunTestsTool = _classThis;
})();
export { RunTestsTool };

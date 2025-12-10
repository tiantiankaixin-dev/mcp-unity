import { z } from 'zod';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { BaseTool } from '../base/BaseTool.js';
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
export declare class RunTestsTool extends BaseTool {
    get name(): string;
    get description(): string;
    get category(): string;
    get inputSchema(): z.ZodObject<{
        testMode: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        testFilter: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        returnOnlyFailures: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        returnWithLogs: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        testMode: string;
        returnWithLogs: boolean;
        testFilter: string;
        returnOnlyFailures: boolean;
    }, {
        testMode?: string | undefined;
        returnWithLogs?: boolean | undefined;
        testFilter?: string | undefined;
        returnOnlyFailures?: boolean | undefined;
    }>;
    /**
     * Custom execution logic preserved from legacy implementation
     * Handles test execution and formats results with detailed statistics
     */
    protected execute(args: any): Promise<CallToolResult>;
}

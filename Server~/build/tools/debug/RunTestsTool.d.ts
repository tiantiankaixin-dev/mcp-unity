import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * RunTests Tool
 * Runs Unity tests
 */
export declare class RunTestsTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        testMode: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        testFilter: z.ZodOptional<z.ZodString>;
        returnOnlyFailures: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        returnWithLogs: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        testMode: string;
        returnWithLogs: boolean;
        returnOnlyFailures: boolean;
        testFilter?: string | undefined;
    }, {
        testMode?: string | undefined;
        returnWithLogs?: boolean | undefined;
        testFilter?: string | undefined;
        returnOnlyFailures?: boolean | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}

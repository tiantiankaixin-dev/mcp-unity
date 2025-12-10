import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
export declare class ValidateScriptTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        scriptPath: z.ZodString;
        validationLevel: z.ZodDefault<z.ZodEnum<["syntax", "compilation", "best_practices", "all"]>>;
        checkNamingConventions: z.ZodDefault<z.ZodBoolean>;
        checkUnityBestPractices: z.ZodDefault<z.ZodBoolean>;
        checkPerformance: z.ZodDefault<z.ZodBoolean>;
        autoFix: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        scriptPath: string;
        validationLevel: "syntax" | "compilation" | "best_practices" | "all";
        checkNamingConventions: boolean;
        checkUnityBestPractices: boolean;
        checkPerformance: boolean;
        autoFix: boolean;
    }, {
        scriptPath: string;
        validationLevel?: "syntax" | "compilation" | "best_practices" | "all" | undefined;
        checkNamingConventions?: boolean | undefined;
        checkUnityBestPractices?: boolean | undefined;
        checkPerformance?: boolean | undefined;
        autoFix?: boolean | undefined;
    }>;
    get category(): string;
    protected beforeExecute(args: any): Promise<void>;
    protected formatSuccessResponse(result: any): CallToolResult;
    protected formatErrorResponse(error: any): CallToolResult;
}

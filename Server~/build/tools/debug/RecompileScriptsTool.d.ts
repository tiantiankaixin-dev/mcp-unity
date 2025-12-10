import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * RecompileScripts Tool
 * Recompiles scripts
 */
export declare class RecompileScriptsTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        returnWithLogs: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        logsLimit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        returnWithLogs: boolean;
        logsLimit: number;
    }, {
        returnWithLogs?: boolean | undefined;
        logsLimit?: number | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}

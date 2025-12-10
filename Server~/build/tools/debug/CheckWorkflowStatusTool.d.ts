import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * Tool to check the current workflow status and resource access history
 * Useful for debugging workflow validation issues
 */
export declare class CheckWorkflowStatusTool extends BaseTool {
    get name(): string;
    get description(): string;
    get category(): string;
    get inputSchema(): z.ZodObject<{
        includeTimestamps: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        includeTimestamps: boolean;
    }, {
        includeTimestamps?: boolean | undefined;
    }>;
    protected execute(args: any): Promise<CallToolResult>;
}

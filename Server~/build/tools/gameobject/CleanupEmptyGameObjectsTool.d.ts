import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * CleanupEmptyGameObjects Tool
 * Removes empty GameObjects from scene
 */
export declare class CleanupEmptyGameObjectsTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        dryRun: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        dryRun?: boolean | undefined;
    }, {
        dryRun?: boolean | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}

import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * GroupGameObjects Tool
 * Groups multiple GameObjects under a parent
 */
export declare class GroupGameObjectsTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        instanceIds: z.ZodArray<z.ZodNumber, "many">;
        groupName: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        centerPivot: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        instanceIds: number[];
        groupName: string;
        centerPivot: boolean;
    }, {
        instanceIds: number[];
        groupName?: string | undefined;
        centerPivot?: boolean | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}

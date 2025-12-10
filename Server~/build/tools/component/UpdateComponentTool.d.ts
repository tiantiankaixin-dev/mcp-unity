import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * UpdateComponent Tool
 * Updates component properties
 */
export declare class UpdateComponentTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        instanceId: z.ZodOptional<z.ZodNumber>;
        objectPath: z.ZodOptional<z.ZodString>;
        componentName: z.ZodString;
        componentData: z.ZodRecord<z.ZodString, z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        componentName: string;
        componentData: Record<string, any>;
        instanceId?: number | undefined;
        objectPath?: string | undefined;
    }, {
        componentName: string;
        componentData: Record<string, any>;
        instanceId?: number | undefined;
        objectPath?: string | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}

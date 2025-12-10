import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * SelectGameObject Tool
 * Selects a GameObject in the hierarchy
 */
export declare class SelectGameObjectTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        objectPath: z.ZodOptional<z.ZodString>;
        objectName: z.ZodOptional<z.ZodString>;
        instanceId: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        instanceId?: number | undefined;
        objectPath?: string | undefined;
        objectName?: string | undefined;
    }, {
        instanceId?: number | undefined;
        objectPath?: string | undefined;
        objectName?: string | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}

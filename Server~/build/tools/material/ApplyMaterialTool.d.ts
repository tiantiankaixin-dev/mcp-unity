import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * ApplyMaterial Tool
 * Applies material to GameObject
 */
export declare class ApplyMaterialTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        instanceIds: z.ZodArray<z.ZodNumber, "many">;
        materialPath: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        instanceIds: number[];
        materialPath: string;
    }, {
        instanceIds: number[];
        materialPath: string;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}

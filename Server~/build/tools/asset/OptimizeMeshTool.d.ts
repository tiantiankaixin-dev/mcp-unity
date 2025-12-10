import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * OptimizeMesh Tool
 * Optimizes mesh
 */
export declare class OptimizeMeshTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        instanceIds: z.ZodArray<z.ZodNumber, "many">;
    }, "strip", z.ZodTypeAny, {
        instanceIds: number[];
    }, {
        instanceIds: number[];
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}

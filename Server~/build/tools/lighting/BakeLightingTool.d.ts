import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * BakeLighting Tool
 * Bakes lighting for the scene
 *
 * Note: This is a long-running async operation (up to 5 minutes timeout on Unity side)
 */
export declare class BakeLightingTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        clearBakedData: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        clearBakedData: boolean;
    }, {
        clearBakedData?: boolean | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}

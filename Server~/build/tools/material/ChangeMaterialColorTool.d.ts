import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * ChangeMaterialColor Tool
 * Changes material color
 */
export declare class ChangeMaterialColorTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        instanceIds: z.ZodArray<z.ZodNumber, "many">;
        color: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>>;
        propertyName: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        instanceIds: number[];
        color: number[];
        propertyName: string;
    }, {
        instanceIds: number[];
        color?: number[] | undefined;
        propertyName?: string | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}

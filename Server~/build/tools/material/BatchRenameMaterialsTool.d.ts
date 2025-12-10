import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * BatchRenameMaterials Tool
 * Batch renames materials
 */
export declare class BatchRenameMaterialsTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        folderPath: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        newNamePrefix: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        startNumber: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        folderPath: string;
        newNamePrefix: string;
        startNumber: number;
    }, {
        folderPath?: string | undefined;
        newNamePrefix?: string | undefined;
        startNumber?: number | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}

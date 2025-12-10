import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * GeneratePrefabVariants Tool
 * Generates prefab variants
 */
export declare class GeneratePrefabVariantsTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        basePrefabPath: z.ZodOptional<z.ZodString>;
        count: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        outputFolder: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        namePrefix: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        count: number;
        outputFolder: string;
        namePrefix: string;
        basePrefabPath?: string | undefined;
    }, {
        count?: number | undefined;
        basePrefabPath?: string | undefined;
        outputFolder?: string | undefined;
        namePrefix?: string | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}

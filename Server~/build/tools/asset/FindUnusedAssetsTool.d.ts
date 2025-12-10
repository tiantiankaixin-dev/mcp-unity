import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * FindUnusedAssets Tool
 * Finds unused assets
 */
export declare class FindUnusedAssetsTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        folderPath: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        includeScripts: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        folderPath: string;
        includeScripts: boolean;
    }, {
        folderPath?: string | undefined;
        includeScripts?: boolean | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}

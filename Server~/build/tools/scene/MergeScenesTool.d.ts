import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * MergeScenes Tool
 * Merges multiple scenes into one
 */
export declare class MergeScenesTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        sourceScenePaths: z.ZodArray<z.ZodString, "many">;
        targetScenePath: z.ZodString;
        createNew: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        saveAfterMerge: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        targetScenePath: string;
        sourceScenePaths: string[];
        createNew: boolean;
        saveAfterMerge: boolean;
    }, {
        targetScenePath: string;
        sourceScenePaths: string[];
        createNew?: boolean | undefined;
        saveAfterMerge?: boolean | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}

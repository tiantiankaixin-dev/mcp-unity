import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * DuplicateScene Tool
 * Duplicates an existing scene
 */
export declare class DuplicateSceneTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodEffects<z.ZodEffects<z.ZodObject<{
        sourceScenePath: z.ZodOptional<z.ZodString>;
        scenePath: z.ZodOptional<z.ZodString>;
        targetScenePath: z.ZodOptional<z.ZodString>;
        newSceneName: z.ZodOptional<z.ZodString>;
        overwrite: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        overwrite: boolean;
        targetScenePath?: string | undefined;
        scenePath?: string | undefined;
        sourceScenePath?: string | undefined;
        newSceneName?: string | undefined;
    }, {
        targetScenePath?: string | undefined;
        overwrite?: boolean | undefined;
        scenePath?: string | undefined;
        sourceScenePath?: string | undefined;
        newSceneName?: string | undefined;
    }>, {
        overwrite: boolean;
        targetScenePath?: string | undefined;
        scenePath?: string | undefined;
        sourceScenePath?: string | undefined;
        newSceneName?: string | undefined;
    }, {
        targetScenePath?: string | undefined;
        overwrite?: boolean | undefined;
        scenePath?: string | undefined;
        sourceScenePath?: string | undefined;
        newSceneName?: string | undefined;
    }>, {
        overwrite: boolean;
        targetScenePath?: string | undefined;
        scenePath?: string | undefined;
        sourceScenePath?: string | undefined;
        newSceneName?: string | undefined;
    }, {
        targetScenePath?: string | undefined;
        overwrite?: boolean | undefined;
        scenePath?: string | undefined;
        sourceScenePath?: string | undefined;
        newSceneName?: string | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}

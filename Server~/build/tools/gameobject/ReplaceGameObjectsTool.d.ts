import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * ReplaceGameObjects Tool
 * Replaces GameObjects with prefabs
 */
export declare class ReplaceGameObjectsTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        instanceIds: z.ZodArray<z.ZodNumber, "many">;
        replacementPrefabPath: z.ZodString;
        keepTransform: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        keepName: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        instanceIds: number[];
        replacementPrefabPath: string;
        keepTransform: boolean;
        keepName: boolean;
    }, {
        instanceIds: number[];
        replacementPrefabPath: string;
        keepTransform?: boolean | undefined;
        keepName?: boolean | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}

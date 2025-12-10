import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * AddScenesToBuild Tool
 * Adds scenes to build settings
 */
export declare class AddScenesToBuildTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        scenePaths: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        scenePaths: string[];
    }, {
        scenePaths: string[];
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}

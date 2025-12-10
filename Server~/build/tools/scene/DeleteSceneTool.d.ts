import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * DeleteScene Tool
 * Deletes a scene from the project
 */
export declare class DeleteSceneTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        scenePath: z.ZodOptional<z.ZodString>;
        sceneName: z.ZodOptional<z.ZodString>;
        folderPath: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        folderPath?: string | undefined;
        sceneName?: string | undefined;
        scenePath?: string | undefined;
    }, {
        folderPath?: string | undefined;
        sceneName?: string | undefined;
        scenePath?: string | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}

import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * Create Scene Tool
 * Creates a new scene and saves it to the specified path
 */
export declare class CreateSceneTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        sceneName: z.ZodString;
        folderPath: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        addToBuildSettings: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        makeActive: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        folderPath: string;
        sceneName: string;
        addToBuildSettings: boolean;
        makeActive: boolean;
    }, {
        sceneName: string;
        folderPath?: string | undefined;
        addToBuildSettings?: boolean | undefined;
        makeActive?: boolean | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}

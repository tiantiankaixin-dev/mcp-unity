import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * CreateMultipleScenes Tool
 * Creates multiple scenes at once
 */
export declare class CreateMultipleScenesTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodEffects<z.ZodEffects<z.ZodObject<{
        baseName: z.ZodOptional<z.ZodString>;
        sceneNames: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        count: z.ZodOptional<z.ZodNumber>;
        startNumber: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        folderPath: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        basePath: z.ZodOptional<z.ZodString>;
        addToBuild: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        folderPath: string;
        startNumber: number;
        addToBuild: boolean;
        basePath?: string | undefined;
        count?: number | undefined;
        baseName?: string | undefined;
        sceneNames?: string[] | undefined;
    }, {
        folderPath?: string | undefined;
        basePath?: string | undefined;
        count?: number | undefined;
        baseName?: string | undefined;
        startNumber?: number | undefined;
        sceneNames?: string[] | undefined;
        addToBuild?: boolean | undefined;
    }>, {
        folderPath: string;
        startNumber: number;
        addToBuild: boolean;
        basePath?: string | undefined;
        count?: number | undefined;
        baseName?: string | undefined;
        sceneNames?: string[] | undefined;
    }, {
        folderPath?: string | undefined;
        basePath?: string | undefined;
        count?: number | undefined;
        baseName?: string | undefined;
        startNumber?: number | undefined;
        sceneNames?: string[] | undefined;
        addToBuild?: boolean | undefined;
    }>, {
        baseName: string;
        sceneNames: string[] | undefined;
        count: number;
        startNumber: number;
        folderPath: string;
        addToBuild: boolean;
    }, {
        folderPath?: string | undefined;
        basePath?: string | undefined;
        count?: number | undefined;
        baseName?: string | undefined;
        startNumber?: number | undefined;
        sceneNames?: string[] | undefined;
        addToBuild?: boolean | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}

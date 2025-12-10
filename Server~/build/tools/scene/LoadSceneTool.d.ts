import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
export declare class LoadSceneTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        scenePath: z.ZodOptional<z.ZodString>;
        sceneName: z.ZodOptional<z.ZodString>;
        folderPath: z.ZodOptional<z.ZodString>;
        additive: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        additive: boolean;
        folderPath?: string | undefined;
        sceneName?: string | undefined;
        scenePath?: string | undefined;
    }, {
        folderPath?: string | undefined;
        sceneName?: string | undefined;
        scenePath?: string | undefined;
        additive?: boolean | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}

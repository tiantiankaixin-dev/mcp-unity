import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * BuildProject Tool
 * Builds the Unity project
 */
export declare class BuildProjectTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        buildPath: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        buildTarget: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        developmentBuild: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        buildPath: string;
        buildTarget: string;
        developmentBuild: boolean;
    }, {
        buildPath?: string | undefined;
        buildTarget?: string | undefined;
        developmentBuild?: boolean | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}

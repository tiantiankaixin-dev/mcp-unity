import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * CreateSkybox Tool
 * Creates a skybox material
 */
export declare class CreateSkyboxTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        skyboxType: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        color: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>>;
    }, "strip", z.ZodTypeAny, {
        color: number[];
        skyboxType: string;
    }, {
        color?: number[] | undefined;
        skyboxType?: string | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}

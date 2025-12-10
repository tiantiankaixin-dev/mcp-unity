import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * CreateMaterial Tool
 * Creates a new material
 */
export declare class CreateMaterialTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        materialName: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        savePath: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        shaderName: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        color: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        savePath: string;
        color: string;
        materialName: string;
        shaderName: string;
    }, {
        savePath?: string | undefined;
        color?: string | undefined;
        materialName?: string | undefined;
        shaderName?: string | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}

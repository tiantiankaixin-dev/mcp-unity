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
        color: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>>;
        metallic: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        smoothness: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        savePath: string;
        color: number[];
        materialName: string;
        shaderName: string;
        metallic: number;
        smoothness: number;
    }, {
        savePath?: string | undefined;
        color?: number[] | undefined;
        materialName?: string | undefined;
        shaderName?: string | undefined;
        metallic?: number | undefined;
        smoothness?: number | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
